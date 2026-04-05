package com.rentalms.service;

import com.rentalms.entity.Building;
import com.rentalms.entity.BuildingManagerAssignment;
import com.rentalms.entity.User;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.repository.BuildingManagerAssignmentRepository;
import com.rentalms.repository.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuildingAssignmentService {

    private final BuildingRepository buildingRepository;
    private final BuildingManagerAssignmentRepository assignmentRepository;
    private final UserService userService;
    private final AuditService auditService;
    private final AccessControlService accessControlService;

    @Transactional
    public BuildingManagerAssignment assignManager(Long buildingId, Long managerId, Long ownerId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException("Khong tim thay building"));
        if (!building.getOwner().getId().equals(ownerId)) {
            throw new BusinessException("Chi OWNER moi co the gan manager cho building nay");
        }

        User manager = userService.findById(managerId);
        if (manager.getRole() != UserRole.MANAGER) {
            throw new BusinessException("Tai khoan duoc gan phai co role MANAGER");
        }

        BuildingManagerAssignment assignment = assignmentRepository.findByBuildingIdAndManagerId(buildingId, managerId)
                .orElse(BuildingManagerAssignment.builder()
                        .building(building)
                        .manager(manager)
                        .build());
        assignment.setActive(true);
        BuildingManagerAssignment saved = assignmentRepository.save(assignment);
        auditService.log(ownerId, null, "ASSIGN_MANAGER", "Building", buildingId,
                "Gan manager " + manager.getEmail() + " vao building " + building.getName());
        return saved;
    }

    @Transactional
    public void unassignManager(Long buildingId, Long managerId, Long ownerId) {
        BuildingManagerAssignment assignment = assignmentRepository.findByBuildingIdAndManagerId(buildingId, managerId)
                .orElseThrow(() -> new BusinessException("Khong tim thay manager assignment"));
        if (!assignment.getBuilding().getOwner().getId().equals(ownerId)) {
            throw new BusinessException("Chi OWNER moi co the go manager");
        }
        assignment.setActive(false);
        assignmentRepository.save(assignment);
        auditService.log(ownerId, null, "UNASSIGN_MANAGER", "Building", buildingId,
                "Go manager " + assignment.getManager().getEmail() + " khoi building");
    }

    public List<Building> getBuildingsForManager(Long managerId) {
        return assignmentRepository.findByManagerIdAndActiveTrue(managerId).stream()
                .map(BuildingManagerAssignment::getBuilding)
                .toList();
    }

    public List<BuildingManagerAssignment> getAssignmentsForBuilding(Long buildingId) {
        return assignmentRepository.findByBuildingIdAndActiveTrue(buildingId);
    }

    public List<BuildingManagerAssignment> getActiveAssignmentsForOwnerBuilding(Long buildingId, User actor) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new BusinessException("Khong tim thay building"));
        accessControlService.assertOwnerOwnsBuilding(actor, building);
        return assignmentRepository.findByBuildingIdAndActiveTrue(buildingId);
    }
}
