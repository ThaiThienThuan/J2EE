package com.rentalms.service;

import com.rentalms.entity.Bill;
import com.rentalms.entity.Building;
import com.rentalms.entity.Contract;
import com.rentalms.entity.MaintenanceRequest;
import com.rentalms.entity.Notification;
import com.rentalms.entity.User;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.repository.BuildingManagerAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccessControlService {

    private final BuildingManagerAssignmentRepository assignmentRepository;

    public boolean canManageBuilding(User actor, Building building) {
        if (actor.getRole() == UserRole.OWNER) {
            return building.getOwner().getId().equals(actor.getId());
        }
        if (actor.getRole() == UserRole.MANAGER) {
            return assignmentRepository.existsActiveAssignment(building.getId(), actor.getId());
        }
        return false;
    }

    public void assertCanManageBuilding(User actor, Building building) {
        if (!canManageBuilding(actor, building)) {
            throw new BusinessException("Khong co quyen quan ly building nay");
        }
    }

    public void assertOwnerOwnsBuilding(User actor, Building building) {
        if (actor.getRole() != UserRole.OWNER || !building.getOwner().getId().equals(actor.getId())) {
            throw new BusinessException("Khong co quyen truy cap building nay");
        }
    }

    public boolean canViewContract(User actor, Contract contract) {
        return switch (actor.getRole()) {
            case OWNER -> contract.getOwner().getId().equals(actor.getId());
            case MANAGER -> assignmentRepository.existsActiveAssignment(
                    contract.getRoom().getBuilding().getId(), actor.getId());
            case TENANT -> contract.getTenant().getId().equals(actor.getId());
            case ADMIN -> true;
        };
    }

    public boolean canViewBill(User actor, Bill bill) {
        return switch (actor.getRole()) {
            case OWNER -> bill.getContract().getOwner().getId().equals(actor.getId());
            case MANAGER -> assignmentRepository.existsActiveAssignment(
                    bill.getContract().getRoom().getBuilding().getId(), actor.getId());
            case TENANT -> bill.getContract().getTenant().getId().equals(actor.getId());
            case ADMIN -> true;
        };
    }

    public boolean canHandleMaintenance(User actor, MaintenanceRequest request) {
        return switch (actor.getRole()) {
            case OWNER -> request.getRoom().getBuilding().getOwner().getId().equals(actor.getId());
            case MANAGER -> assignmentRepository.existsActiveAssignment(
                    request.getRoom().getBuilding().getId(), actor.getId());
            case TENANT -> request.getTenant().getId().equals(actor.getId());
            case ADMIN -> true;
        };
    }

    public boolean canReadNotification(User actor, Notification notification) {
        return notification.getRecipient() != null && notification.getRecipient().getId().equals(actor.getId());
    }

    public void assertCanReadNotification(User actor, Notification notification) {
        if (!canReadNotification(actor, notification)) {
            throw new BusinessException("Khong co quyen doc thong bao nay");
        }
    }
}
