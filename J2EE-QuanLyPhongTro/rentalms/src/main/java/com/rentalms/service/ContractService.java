package com.rentalms.service;

import com.rentalms.dto.ContractDTO;
import com.rentalms.entity.Contract;
import com.rentalms.entity.Room;
import com.rentalms.entity.User;
import com.rentalms.enums.ContractStatus;
import com.rentalms.enums.RoomStatus;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.exception.NotFoundException;
import com.rentalms.repository.ContractRepository;
import com.rentalms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepo;
    private final RoomRepository roomRepo;
    private final UserService userService;
    private final AuditService auditService;
    private final AccessControlService accessControlService;

    @Transactional
    public Contract create(ContractDTO.CreateRequest req, Long ownerId) {
        Room room = roomRepo.findById(req.getRoomId())
                .orElseThrow(() -> new NotFoundException("Khong tim thay phong"));

        if (room.getStatus() != RoomStatus.AVAILABLE && room.getStatus() != RoomStatus.RESERVED) {
            throw new BusinessException("Phong hien khong the tao hop dong");
        }

        if (contractRepo.existsOverlap(req.getRoomId(), req.getStartDate(), req.getEndDate())) {
            throw new BusinessException("Phong da co hop dong trong khoang thoi gian nay");
        }

        User tenant = userService.findById(req.getTenantId());
        User owner = userService.findById(ownerId);
        if (owner.getRole() != UserRole.OWNER) {
            throw new BusinessException("Chi OWNER moi co the tao hop dong nghiep vu");
        }
        accessControlService.assertOwnerOwnsBuilding(owner, room.getBuilding());

        Contract contract = Contract.builder()
                .room(room)
                .tenant(tenant)
                .owner(owner)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .deposit(req.getDeposit())
                .monthlyRent(req.getMonthlyRent() != null ? req.getMonthlyRent() : room.getPrice())
                .rentCycle(req.getRentCycle())
                .policy(req.getPolicy())
                .lateFeePercent(req.getLateFeePercent())
                .activationConfirmed(false)
                .status(ContractStatus.PENDING)
                .build();

        contract = contractRepo.save(contract);
        auditService.log(ownerId, owner.getEmail(), "CREATE", "Contract", contract.getId(),
                "Tao hop dong phong " + room.getRoomNo() + " cho tenant " + tenant.getEmail());
        return contract;
    }

    @Transactional
    public Contract confirmActivation(Long contractId, Long ownerId) {
        Contract c = findById(contractId);
        accessControlService.assertOwnerOwnsBuilding(userService.findById(ownerId), c.getRoom().getBuilding());
        if (c.isActivationConfirmed()) {
            throw new BusinessException("Hop dong nay da duoc kich hoat");
        }
        c.setActivationConfirmed(true);
        c.setStatus(ContractStatus.ACTIVE);
        c.getRoom().setStatus(RoomStatus.OCCUPIED);
        roomRepo.save(c.getRoom());
        auditService.log(ownerId, null, "CONFIRM_CONTRACT", "Contract", contractId,
                "Kich hoat hop dong phong " + c.getRoom().getRoomNo());
        return contractRepo.save(c);
    }

    @Transactional
    public Contract terminate(Long contractId, Long ownerId) {
        Contract c = findById(contractId);
        accessControlService.assertOwnerOwnsBuilding(userService.findById(ownerId), c.getRoom().getBuilding());
        if (c.getStatus() != ContractStatus.ACTIVE) {
            throw new BusinessException("Chi co the ket thuc hop dong ACTIVE");
        }
        c.setStatus(ContractStatus.TERMINATED);
        c.setActivationConfirmed(false);
        c.getRoom().setStatus(RoomStatus.AVAILABLE);
        roomRepo.save(c.getRoom());

        auditService.log(ownerId, null, "TERMINATE", "Contract", contractId,
                "Ket thuc hop dong phong " + c.getRoom().getRoomNo());
        return contractRepo.save(c);
    }

    @Transactional
    public Contract renew(Long contractId, LocalDate newEndDate, Long ownerId) {
        Contract c = findById(contractId);
        accessControlService.assertOwnerOwnsBuilding(userService.findById(ownerId), c.getRoom().getBuilding());
        if (c.getStatus() != ContractStatus.ACTIVE) {
            throw new BusinessException("Chi co the gia han hop dong ACTIVE");
        }
        if (newEndDate == null || !newEndDate.isAfter(c.getEndDate())) {
            throw new BusinessException("Ngay ket thuc moi phai lon hon ngay ket thuc hien tai");
        }
        c.setEndDate(newEndDate);
        c.setStatus(ContractStatus.ACTIVE);
        auditService.log(ownerId, null, "RENEW", "Contract", contractId,
                "Gia han den: " + newEndDate);
        return contractRepo.save(c);
    }

    public Contract findById(Long id) {
        return contractRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hop dong id: " + id));
    }

    public Contract findByIdForTenant(Long contractId, Long tenantId) {
        Contract c = findById(contractId);
        if (!c.getTenant().getId().equals(tenantId)) {
            throw new BusinessException("Ban khong co quyen xem hop dong nay");
        }
        return c;
    }

    public Contract findByIdForOwner(Long contractId, Long ownerId) {
        Contract c = findById(contractId);
        accessControlService.assertOwnerOwnsBuilding(userService.findById(ownerId), c.getRoom().getBuilding());
        return c;
    }

    public List<Contract> getByOwner(Long ownerId) {
        return contractRepo.findByOwnerId(ownerId);
    }

    public List<Contract> getByTenant(Long tenantId) {
        return contractRepo.findByTenantId(tenantId);
    }

    public List<Contract> getByOwner(Long ownerId, ContractStatus status) {
        return contractRepo.findOwnerContracts(ownerId, status);
    }

    @Transactional
    public int expireContracts(LocalDate today) {
        int changed = 0;
        for (Contract contract : contractRepo.findByStatus(ContractStatus.ACTIVE)) {
            if (contract.getEndDate() != null && contract.getEndDate().isBefore(today)) {
                contract.setStatus(ContractStatus.EXPIRED);
                contract.setActivationConfirmed(false);
                contract.getRoom().setStatus(RoomStatus.AVAILABLE);
                roomRepo.save(contract.getRoom());
                contractRepo.save(contract);
                changed++;
            }
        }
        return changed;
    }

    public ContractDTO.Response toResponse(Contract c) {
        ContractDTO.Response r = new ContractDTO.Response();
        r.setId(c.getId());
        r.setRoomId(c.getRoom().getId());
        r.setRoomNo(c.getRoom().getRoomNo());
        r.setBuildingName(c.getRoom().getBuilding().getName());
        r.setTenantId(c.getTenant().getId());
        r.setTenantName(c.getTenant().getFullName());
        r.setTenantEmail(c.getTenant().getEmail());
        r.setStartDate(c.getStartDate());
        r.setEndDate(c.getEndDate());
        r.setDeposit(c.getDeposit());
        r.setMonthlyRent(c.getMonthlyRent());
        r.setStatus(c.getStatus().name());
        r.setCreatedAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        return r;
    }
}
