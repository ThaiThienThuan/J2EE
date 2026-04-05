package com.rentalms.repository;

import com.rentalms.entity.Room;
import com.rentalms.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByBuildingId(Long buildingId);
    List<Room> findByBuildingIdAndStatus(Long buildingId, RoomStatus status);
    boolean existsByBuildingIdAndRoomNo(Long buildingId, String roomNo);
    Optional<Room> findByBuildingIdAndRoomNo(Long buildingId, String roomNo);
    @Query("SELECT r FROM Room r WHERE r.id = :roomId AND r.building.publishStatus = 'PUBLIC'")
    Optional<Room> findPublicRoomById(Long roomId);
    @Query("SELECT r FROM Room r WHERE r.building.id = :buildingId AND r.building.publishStatus = 'PUBLIC' AND r.status = 'AVAILABLE'")
    List<Room> findAvailablePublicRoomsByBuildingId(Long buildingId);

    @Query("SELECT DISTINCT r FROM Room r JOIN FETCH r.building b JOIN FETCH b.owner WHERE UPPER(TRIM(b.publishStatus)) = 'PUBLIC' AND r.status = :status ORDER BY r.price ASC")
    List<Room> findPublicAvailableRoomsOrderByPriceAsc(@Param("status") RoomStatus status);
    @Query("SELECT r FROM Room r WHERE r.building.owner.id = :ownerId " +
            "AND (:buildingId IS NULL OR r.building.id = :buildingId) " +
            "AND (:status IS NULL OR r.status = :status) ORDER BY r.createdAt DESC")
    List<Room> findOwnerRooms(Long ownerId, Long buildingId, RoomStatus status);

    @Query("SELECT r FROM Room r WHERE r.building.id = :buildingId ORDER BY r.createdAt DESC")
    List<Room> findManagerRooms(Long buildingId);

    @Query("SELECT r FROM Room r WHERE r.building.id = :buildingId AND " +
           "r.status = 'AVAILABLE' AND " +
           "(:minPrice IS NULL OR r.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR r.price <= :maxPrice) AND " +
           "(:minArea IS NULL OR r.area >= :minArea)")
    List<Room> searchAvailable(Long buildingId, java.math.BigDecimal minPrice,
                                java.math.BigDecimal maxPrice, Double minArea);

    @Query("SELECT COUNT(r) FROM Room r WHERE r.building.id = :buildingId AND r.status = 'OCCUPIED'")
    long countOccupied(Long buildingId);

    @Query("SELECT COUNT(r) FROM Room r WHERE r.building.id = :buildingId")
    long countTotal(Long buildingId);

    // Dem phong theo trang thai (toan he thong)
    long countByStatus(RoomStatus status);
}
