package com.rentalms.repository;

import com.rentalms.entity.MeterReading;
import com.rentalms.enums.UtilityType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    Optional<MeterReading> findByRoomIdAndPeriodAndUtilityType(Long roomId, String period, UtilityType utilityType);
    List<MeterReading> findByRoomIdOrderByRecordedAtDesc(Long roomId);
    List<MeterReading> findByRoomBuildingIdAndPeriodOrderByRecordedAtDesc(Long buildingId, String period);
    @org.springframework.data.jpa.repository.Query("SELECT m FROM MeterReading m WHERE m.room.building.id = :buildingId " +
            "AND (:period IS NULL OR m.period = :period) ORDER BY m.recordedAt DESC")
    List<MeterReading> findByBuildingIdAndOptionalPeriodOrderByRecordedAtDesc(Long buildingId, String period);
}
