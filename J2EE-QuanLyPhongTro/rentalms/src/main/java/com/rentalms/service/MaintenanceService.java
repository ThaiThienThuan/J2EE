package com.rentalms.service;

import com.rentalms.entity.MaintenanceRequest;
import com.rentalms.entity.Room;
import com.rentalms.entity.User;
import com.rentalms.enums.MaintenanceStatus;
import com.rentalms.enums.NotificationType;
import com.rentalms.enums.RoomStatus;
import com.rentalms.exception.BusinessException;
import com.rentalms.exception.NotFoundException;
import com.rentalms.repository.ContractRepository;
import com.rentalms.repository.MaintenanceRequestRepository;
import com.rentalms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRequestRepository mainRepo;
    private final RoomRepository roomRepo;
    private final ContractRepository contractRepo;
    private final UserService userService;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final AccessControlService accessControlService;

    @Transactional
    public MaintenanceRequest create(Long roomId, String title, String description,
                                      String priority, String imageUrl, Long tenantId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay phong"));
        User tenant = userService.findById(tenantId);
        boolean hasActiveContract = contractRepo.findByRoomIdAndStatus(roomId,
                        com.rentalms.enums.ContractStatus.ACTIVE)
                .filter(contract -> contract.isActivationConfirmed()
                        && contract.getTenant().getId().equals(tenantId))
                .isPresent();
        if (!hasActiveContract) {
            throw new BusinessException("Chi duoc gui bao tri cho phong dang thue");
        }

        MaintenanceRequest req = MaintenanceRequest.builder()
                .room(room)
                .tenant(tenant)
                .title(title != null && !title.isBlank() ? title : "Yeu cau bao tri")
                .description(description)
                .priority(priority != null ? priority : "MEDIUM")
                .imageUrl(imageUrl)
                .status(MaintenanceStatus.NEW)
                .build();
        req = mainRepo.save(req);
        final Long reqId = req.getId();

        auditService.log(tenantId, tenant.getEmail(), "CREATE", "Maintenance", reqId,
                "Bao tri phong " + room.getRoomNo() + ": " + description);

        // Thong bao cho chu nha cua phong nay
        contractRepo.findByRoomIdAndStatus(roomId,
                com.rentalms.enums.ContractStatus.ACTIVE).ifPresent(contract -> {
            User owner = contract.getOwner();
            notificationService.notify(
                    owner,
                    NotificationType.MAINTENANCE_SUBMITTED,
                    "Yeu cau bao tri moi",
                    tenant.getFullName() + " gui yeu cau bao tri phong "
                            + room.getRoomNo() + ": " + description
                            + " (Muc uu tien: " + (priority != null ? priority : "MEDIUM") + ").",
                    "Maintenance", reqId
            );
        });

        return req;
    }

    @Transactional
    public MaintenanceRequest updateStatus(Long id, String status,
                                            String note, Double cost, Long managerId) {
        MaintenanceRequest req = mainRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay yeu cau bao tri"));
        User actor = userService.findById(managerId);
        if (!accessControlService.canHandleMaintenance(actor, req)
                || actor.getRole() == com.rentalms.enums.UserRole.ADMIN) {
            throw new BusinessException("Khong co quyen xu ly yeu cau bao tri nay");
        }

        MaintenanceStatus newStatus;
        try {
            newStatus = MaintenanceStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Trang thai bao tri khong hop le");
        }
        MaintenanceStatus currentStatus = req.getStatus();
        boolean validTransition =
                (currentStatus == MaintenanceStatus.NEW && newStatus == MaintenanceStatus.IN_PROGRESS) ||
                (currentStatus == MaintenanceStatus.IN_PROGRESS &&
                        (newStatus == MaintenanceStatus.DONE || newStatus == MaintenanceStatus.CANCELLED));
        if (!validTransition) {
            throw new BusinessException("Chuyen trang thai bao tri khong hop le");
        }
        req.setStatus(newStatus);
        req.setResolutionNote(note);
        req.setRepairCost(cost);

        if (status.equals("IN_PROGRESS")) {
            req.getRoom().setStatus(RoomStatus.MAINTENANCE);
            roomRepo.save(req.getRoom());
        } else if (status.equals("DONE")) {
            boolean activeContract = contractRepo.findByRoomIdAndStatus(req.getRoom().getId(),
                    com.rentalms.enums.ContractStatus.ACTIVE).filter(com.rentalms.entity.Contract::isActivationConfirmed).isPresent();
            req.getRoom().setStatus(activeContract ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE);
            roomRepo.save(req.getRoom());
        } else if (status.equals("CANCELLED")) {
            boolean activeContract = contractRepo.findByRoomIdAndStatus(req.getRoom().getId(),
                    com.rentalms.enums.ContractStatus.ACTIVE).filter(com.rentalms.entity.Contract::isActivationConfirmed).isPresent();
            req.getRoom().setStatus(activeContract ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE);
            roomRepo.save(req.getRoom());
        }

        auditService.log(managerId, null, "UPDATE", "Maintenance", id,
                "Cap nhat trang thai: " + status);

        MaintenanceRequest saved = mainRepo.save(req);

        // Thong bao cho tenant ve viec cap nhat trang thai
        String statusLabel = switch (newStatus) {
            case IN_PROGRESS -> "Dang xu ly";
            case DONE -> "Da hoan thanh";
            case CANCELLED -> "Da huy";
            default -> status;
        };
        String message = "Yeu cau bao tri phong " + req.getRoom().getRoomNo()
                + " cua ban da duoc cap nhat trang thai: " + statusLabel + ".";
        if (note != null && !note.isBlank()) {
            message += " Ghi chu: " + note;
        }
        if (cost != null && cost > 0) {
            message += " Chi phi sua chua: " + cost + " VND.";
        }

        notificationService.notify(
                req.getTenant(),
                NotificationType.MAINTENANCE_STATUS_UPDATED,
                "Cap nhat yeu cau bao tri",
                message,
                "Maintenance", id
        );

        return saved;
    }

    public List<MaintenanceRequest> getByBuilding(Long buildingId) {
        return mainRepo.findByBuildingIdOrderByCreatedAtDesc(buildingId);
    }

    public List<MaintenanceRequest> getByBuilding(Long buildingId, User actor) {
        Room room = roomRepo.findByBuildingId(buildingId).stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Khong tim thay building"));
        accessControlService.assertCanManageBuilding(actor, room.getBuilding());
        return mainRepo.findByBuildingIdOrderByCreatedAtDesc(buildingId);
    }

    public List<MaintenanceRequest> getByTenant(Long tenantId) {
        return mainRepo.findVisibleByTenantIdOrderByCreatedAtDesc(tenantId);
    }
}
