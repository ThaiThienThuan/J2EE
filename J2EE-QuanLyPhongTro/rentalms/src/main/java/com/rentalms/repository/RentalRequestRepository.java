package com.rentalms.repository;

import com.rentalms.entity.RentalRequest;
import com.rentalms.enums.RentalRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {

    List<RentalRequest> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    @Query("SELECT r FROM RentalRequest r WHERE r.room.building.owner.id = :ownerId ORDER BY r.createdAt DESC")
    List<RentalRequest> findByOwnerId(Long ownerId);

    @Query("SELECT r FROM RentalRequest r WHERE r.room.building.owner.id = :ownerId " +
            "AND (:status IS NULL OR r.status = :status) ORDER BY r.createdAt DESC")
    List<RentalRequest> findByOwnerIdAndOptionalStatus(Long ownerId, RentalRequestStatus status);

    List<RentalRequest> findByRoomId(Long roomId);

    boolean existsByRoomIdAndTenantIdAndStatus(Long roomId, Long tenantId, RentalRequestStatus status);
}
