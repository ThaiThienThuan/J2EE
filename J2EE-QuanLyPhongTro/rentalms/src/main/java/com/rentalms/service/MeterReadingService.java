package com.rentalms.service;

import com.rentalms.entity.Bill;
import com.rentalms.entity.BillItem;
import com.rentalms.entity.MeterReading;
import com.rentalms.entity.Room;
import com.rentalms.entity.User;
import com.rentalms.enums.UtilityType;
import com.rentalms.exception.BusinessException;
import com.rentalms.exception.NotFoundException;
import com.rentalms.repository.BillItemRepository;
import com.rentalms.repository.BillRepository;
import com.rentalms.repository.MeterReadingRepository;
import com.rentalms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeterReadingService {

    private final MeterReadingRepository meterReadingRepository;
    private final RoomRepository roomRepository;
    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final AccessControlService accessControlService;
    private final AuditService auditService;

    @Transactional
    public MeterReading record(Long roomId, String period, UtilityType utilityType,
                               Double previousReading, Double currentReading, BigDecimal unitPrice,
                               String note, User actor) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay phong"));
        accessControlService.assertCanManageBuilding(actor, room.getBuilding());

        if (currentReading < previousReading) {
            throw new BusinessException("Chi so moi khong duoc nho hon chi so cu");
        }

        MeterReading reading = meterReadingRepository.findByRoomIdAndPeriodAndUtilityType(roomId, period, utilityType)
                .orElse(MeterReading.builder()
                        .room(room)
                        .period(period)
                        .utilityType(utilityType)
                        .recordedBy(actor)
                        .build());
        reading.setPreviousReading(previousReading);
        reading.setCurrentReading(currentReading);
        reading.setUnitPrice(unitPrice);
        reading.setRecordedBy(actor);
        reading.setNote(note);
        MeterReading saved = meterReadingRepository.save(reading);

        auditService.log(actor.getId(), actor.getEmail(), "RECORD_METER", "MeterReading", saved.getId(),
                "Nhap chi so " + utilityType + " cho phong " + room.getRoomNo() + " ky " + period);

        syncBillItem(saved, actor);
        return saved;
    }

    public List<MeterReading> getByBuildingAndPeriod(Long buildingId, String period, User actor) {
        List<MeterReading> readings = meterReadingRepository.findByBuildingIdAndOptionalPeriodOrderByRecordedAtDesc(buildingId, period);
        if (readings.isEmpty()) {
            Room anyRoom = roomRepository.findByBuildingId(buildingId).stream().findFirst()
                    .orElseThrow(() -> new NotFoundException("Khong tim thay building hoac khong co du lieu cong to"));
            accessControlService.assertCanManageBuilding(actor, anyRoom.getBuilding());
            return readings;
        }
        accessControlService.assertCanManageBuilding(actor, readings.get(0).getRoom().getBuilding());
        return readings;
    }

    @Transactional
    protected void syncBillItem(MeterReading reading, User actor) {
        Bill bill = billRepository.findByContractIdAndPeriod(
                reading.getRoom().getContracts().stream()
                        .filter(contract -> contract.isActivationConfirmed())
                        .findFirst()
                        .orElseThrow(() -> new BusinessException("Phong chua co hop dong active de tao hoa don"))
                        .getId(),
                reading.getPeriod()
        ).orElse(null);

        if (bill == null) {
            return;
        }

        String itemType = reading.getUtilityType().name();
        BigDecimal amount = reading.getUnitPrice()
                .multiply(BigDecimal.valueOf(reading.getCurrentReading() - reading.getPreviousReading()));

        BillItem existing = billItemRepository.findByBillId(bill.getId()).stream()
                .filter(item -> itemType.equalsIgnoreCase(item.getItemType()))
                .findFirst()
                .orElse(null);

        if (existing == null) {
            existing = BillItem.builder().bill(bill).itemType(itemType).build();
        }
        existing.setDescription(itemType + " " + reading.getPeriod());
        existing.setAmount(amount);
        existing.setPreviousReading(reading.getPreviousReading());
        existing.setCurrentReading(reading.getCurrentReading());
        existing.setUnitPrice(reading.getUnitPrice());
        billItemRepository.save(existing);

        BigDecimal totalItems = billItemRepository.findByBillId(bill.getId()).stream()
                .map(BillItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        bill.setTotalAmount(totalItems);
        bill.setOutstandingAmount(totalItems.add(bill.getLateFee()).subtract(bill.getPaidAmount()).max(BigDecimal.ZERO));
        billRepository.save(bill);

        auditService.log(actor.getId(), actor.getEmail(), "SYNC_BILL_ITEM", "Bill", bill.getId(),
                "Dong bo bill item tu meter reading");
    }

    public String currentPeriod() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }
}
