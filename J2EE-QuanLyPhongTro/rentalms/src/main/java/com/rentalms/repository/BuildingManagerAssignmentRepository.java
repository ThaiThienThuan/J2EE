package com.rentalms.repository;

import com.rentalms.entity.BuildingManagerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BuildingManagerAssignmentRepository extends JpaRepository<BuildingManagerAssignment, Long> {
    List<BuildingManagerAssignment> findByManagerIdAndActiveTrue(Long managerId);
    List<BuildingManagerAssignment> findByBuildingIdAndActiveTrue(Long buildingId);
    Optional<BuildingManagerAssignment> findByBuildingIdAndManagerId(Long buildingId, Long managerId);

    @Query("select count(a) > 0 from BuildingManagerAssignment a " +
            "where a.building.id = :buildingId and a.manager.id = :managerId and a.active = true")
    boolean existsActiveAssignment(Long buildingId, Long managerId);
}
