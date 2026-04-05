package com.rentalms.dto.v1;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class CommonViewDTO {

    @Data
    @Builder
    public static class BuildingSummary {
        private Long id;
        private String name;
        private String address;
        private String description;
        private String publishStatus;
        private String ownerName;
    }

    @Data
    @Builder
    public static class BuildingDetailView {
        private Long id;
        private String name;
        private String address;
        private String description;
        private String publishStatus;
        private LocalDateTime createdAt;
        private long totalRooms;
    }

    @Data
    @Builder
    public static class MarketplaceRoomSummaryView {
        private Long id;
        /** Same as roomNo from domain */
        private String roomNumber;
        private BigDecimal price;
        private Double area;
        private Integer beds;
        private String status;
        private String description;
        private String amenities;
        private Long buildingId;
        private String buildingName;
        private String buildingAddress;
        private String ownerName;
        private List<String> imageUrls;
    }

    @Data
    @Builder
    public static class MarketplaceRoomDetailView {
        private Long id;
        private String roomNumber;
        private BigDecimal price;
        private Double area;
        private Integer beds;
        private String status;
        private String description;
        private String amenities;
        private String buildingName;
        private String buildingAddress;
        private Long buildingId;
        private Long ownerId;
        private String ownerName;
        private List<String> imageUrls;
    }

    @Data
    @Builder
    public static class OwnerAvailableManagerView {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
    }

    @Data
    @Builder
    public static class ManagerAssignmentView {
        private Long id;
        private Long managerId;
        private String managerName;
        private String managerEmail;
        private boolean active;
        private LocalDateTime assignedAt;
    }

    @Data
    @Builder
    public static class OwnerManagerView {
        private Long userId;
        private String fullName;
        private String email;
        private LocalDateTime assignedAt;
    }

    @Data
    @Builder
    public static class ContractView {
        private Long id;
        private Long roomId;
        private String roomNo;
        private String buildingName;
        private String buildingAddress;
        private String tenantName;
        private String tenantEmail;
        private String tenantPhone;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal monthlyRent;
        private BigDecimal deposit;
        private String rentCycle;
        private String policy;
        private Double lateFeePercent;
        private boolean activationConfirmed;
        private String status;
    }

    @Data
    @Builder
    public static class OwnerContractView {
        private Long id;
        private Long roomId;
        private String tenantName;
        private String tenantEmail;
        private String tenantPhone;
        private String roomNumber;
        private String buildingName;
        private String buildingAddress;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private boolean activationConfirmed;
        private BigDecimal monthlyRent;
        private BigDecimal deposit;
        private String rentCycle;
        private String policy;
        private Double lateFeePercent;
    }

    @Data
    @Builder
    public static class BillItemView {
        private Long id;
        private String itemType;
        private String description;
        private BigDecimal amount;
        private Double previousReading;
        private Double currentReading;
        private BigDecimal unitPrice;
    }

    @Data
    @Builder
    public static class BillView {
        private Long id;
        private Long contractId;
        private String period;
        private String roomNo;
        private String buildingName;
        private String tenantName;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal outstandingAmount;
        private BigDecimal creditApplied;
        private BigDecimal creditGenerated;
        private BigDecimal lateFee;
        private String status;
        private LocalDate dueDate;
        private List<BillItemView> items;
    }

    @Data
    @Builder
    public static class OwnerBillView {
        private Long id;
        private String tenantName;
        private String roomNumber;
        private BigDecimal totalAmount;
        private String status;
        private LocalDate dueDate;
        private String period;
    }

    @Data
    @Builder
    public static class MaintenanceView {
        private Long id;
        private String title;
        private String description;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String roomName;
    }

    @Data
    @Builder
    public static class OwnerRentalRequestView {
        private Long id;
        private String tenantName;
        private String tenantEmail;
        private String roomNumber;
        private String buildingName;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class OwnerRoomView {
        private Long id;
        private String roomNumber;
        private BigDecimal price;
        private Double area;
        private String status;
        private String buildingName;
        private Long buildingId;
    }

    @Data
    @Builder
    public static class MeterReadingView {
        private Long id;
        private String roomNumber;
        private String utilityType;
        private Double previousReading;
        private Double currentReading;
        private BigDecimal unitPrice;
        private LocalDateTime recordedAt;
        private String recordedByName;
    }

    @Data
    @Builder
    public static class ManagerBuildingView {
        private Long id;
        private String name;
        private String address;
        private String publishStatus;
    }

    @Data
    @Builder
    public static class ManagerRoomView {
        private Long id;
        private String roomNumber;
        private BigDecimal price;
        private Double area;
        private String status;
    }

    @Data
    @Builder
    public static class ManagerMaintenanceView {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String roomNumber;
        private String tenantName;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class ManagerBillView {
        private Long id;
        private String tenantName;
        private String roomNumber;
        private BigDecimal totalAmount;
        private String status;
        private LocalDate dueDate;
        private String period;
    }
}
