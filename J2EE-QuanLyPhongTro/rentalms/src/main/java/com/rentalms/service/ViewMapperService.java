package com.rentalms.service;

import com.rentalms.dto.v1.CommonViewDTO;
import com.rentalms.entity.*;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViewMapperService {

    private static List<String> splitImageUrls(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public CommonViewDTO.BuildingSummary toBuildingSummary(Building building) {
        return CommonViewDTO.BuildingSummary.builder()
                .id(building.getId())
                .name(building.getName())
                .address(building.getAddress())
                .description(building.getDescription())
                .publishStatus(building.getPublishStatus())
                .ownerName(building.getOwner() != null ? building.getOwner().getFullName() : null)
                .build();
    }

    public CommonViewDTO.BuildingDetailView toBuildingDetailView(Building building, long totalRooms) {
        return CommonViewDTO.BuildingDetailView.builder()
                .id(building.getId())
                .name(building.getName())
                .address(building.getAddress())
                .description(building.getDescription())
                .publishStatus(building.getPublishStatus())
                .createdAt(building.getCreatedAt())
                .totalRooms(totalRooms)
                .build();
    }

    public CommonViewDTO.MarketplaceRoomSummaryView toMarketplaceRoomSummary(Room room) {
        Building b = room.getBuilding();
        User owner = b.getOwner();
        return CommonViewDTO.MarketplaceRoomSummaryView.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNo())
                .price(room.getPrice())
                .area(room.getArea())
                .beds(room.getBeds())
                .status(room.getStatus().name())
                .description(room.getDescription())
                .amenities(room.getAmenities())
                .buildingId(b.getId())
                .buildingName(b.getName())
                .buildingAddress(b.getAddress())
                .ownerName(owner != null ? owner.getFullName() : null)
                .imageUrls(splitImageUrls(room.getImageUrl()))
                .build();
    }

    public CommonViewDTO.MarketplaceRoomDetailView toMarketplaceRoomDetail(Room room) {
        Building b = room.getBuilding();
        User owner = b.getOwner();
        return CommonViewDTO.MarketplaceRoomDetailView.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNo())
                .price(room.getPrice())
                .area(room.getArea())
                .beds(room.getBeds())
                .status(room.getStatus().name())
                .description(room.getDescription())
                .amenities(room.getAmenities())
                .buildingName(b.getName())
                .buildingAddress(b.getAddress())
                .buildingId(b.getId())
                .ownerId(owner != null ? owner.getId() : null)
                .ownerName(owner != null ? owner.getFullName() : null)
                .imageUrls(splitImageUrls(room.getImageUrl()))
                .build();
    }

    public CommonViewDTO.ManagerAssignmentView toAssignmentView(BuildingManagerAssignment assignment) {
        return CommonViewDTO.ManagerAssignmentView.builder()
                .id(assignment.getId())
                .managerId(assignment.getManager().getId())
                .managerName(assignment.getManager().getFullName())
                .managerEmail(assignment.getManager().getEmail())
                .active(assignment.isActive())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }

    public CommonViewDTO.OwnerManagerView toOwnerManagerView(BuildingManagerAssignment assignment) {
        return CommonViewDTO.OwnerManagerView.builder()
                .userId(assignment.getManager().getId())
                .fullName(assignment.getManager().getFullName())
                .email(assignment.getManager().getEmail())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }

    public CommonViewDTO.OwnerAvailableManagerView toOwnerAvailableManagerView(User user) {
        return CommonViewDTO.OwnerAvailableManagerView.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }

    public CommonViewDTO.ContractView toContractView(Contract contract) {
        Room room = contract.getRoom();
        Building building = room.getBuilding();
        User tenant = contract.getTenant();
        return CommonViewDTO.ContractView.builder()
                .id(contract.getId())
                .roomId(room.getId())
                .roomNo(room.getRoomNo())
                .buildingName(building.getName())
                .buildingAddress(building.getAddress())
                .tenantName(tenant.getFullName())
                .tenantEmail(tenant.getEmail())
                .tenantPhone(tenant.getPhone())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .monthlyRent(contract.getMonthlyRent())
                .deposit(contract.getDeposit())
                .rentCycle(contract.getRentCycle())
                .policy(contract.getPolicy())
                .lateFeePercent(contract.getLateFeePercent())
                .activationConfirmed(contract.isActivationConfirmed())
                .status(contract.getStatus().name())
                .build();
    }

    public CommonViewDTO.OwnerContractView toOwnerContractView(Contract contract) {
        Room room = contract.getRoom();
        Building building = room.getBuilding();
        User tenant = contract.getTenant();
        return CommonViewDTO.OwnerContractView.builder()
                .id(contract.getId())
                .roomId(room.getId())
                .tenantName(tenant.getFullName())
                .tenantEmail(tenant.getEmail())
                .tenantPhone(tenant.getPhone())
                .roomNumber(room.getRoomNo())
                .buildingName(building.getName())
                .buildingAddress(building.getAddress())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus().name())
                .activationConfirmed(contract.isActivationConfirmed())
                .monthlyRent(contract.getMonthlyRent())
                .deposit(contract.getDeposit())
                .rentCycle(contract.getRentCycle())
                .policy(contract.getPolicy())
                .lateFeePercent(contract.getLateFeePercent())
                .build();
    }

    public CommonViewDTO.BillView toBillView(Bill bill) {
        return CommonViewDTO.BillView.builder()
                .id(bill.getId())
                .contractId(bill.getContract().getId())
                .period(bill.getPeriod())
                .roomNo(bill.getContract().getRoom().getRoomNo())
                .buildingName(bill.getContract().getRoom().getBuilding().getName())
                .tenantName(bill.getContract().getTenant().getFullName())
                .totalAmount(bill.getTotalAmount())
                .paidAmount(bill.getPaidAmount())
                .outstandingAmount(bill.getOutstandingAmount())
                .creditApplied(bill.getCreditApplied())
                .creditGenerated(bill.getCreditGenerated())
                .lateFee(bill.getLateFee())
                .status(bill.getStatus().name())
                .dueDate(bill.getDueDate())
                .items(bill.getItems() == null ? java.util.List.of() : bill.getItems().stream().map(this::toBillItemView).toList())
                .build();
    }

    public CommonViewDTO.OwnerBillView toOwnerBillView(Bill bill) {
        return CommonViewDTO.OwnerBillView.builder()
                .id(bill.getId())
                .tenantName(bill.getContract().getTenant().getFullName())
                .roomNumber(bill.getContract().getRoom().getRoomNo())
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus().name())
                .dueDate(bill.getDueDate())
                .period(bill.getPeriod())
                .build();
    }

    public CommonViewDTO.BillItemView toBillItemView(BillItem item) {
        return CommonViewDTO.BillItemView.builder()
                .id(item.getId())
                .itemType(item.getItemType())
                .description(item.getDescription())
                .amount(item.getAmount())
                .previousReading(item.getPreviousReading())
                .currentReading(item.getCurrentReading())
                .unitPrice(item.getUnitPrice())
                .build();
    }

    public CommonViewDTO.MaintenanceView toMaintenanceView(MaintenanceRequest request) {
        return CommonViewDTO.MaintenanceView.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .roomName(request.getRoom().getRoomNo())
                .build();
    }

    public CommonViewDTO.OwnerRentalRequestView toOwnerRentalRequestView(RentalRequest request) {
        return CommonViewDTO.OwnerRentalRequestView.builder()
                .id(request.getId())
                .tenantName(request.getTenant().getFullName())
                .tenantEmail(request.getTenant().getEmail())
                .roomNumber(request.getRoom().getRoomNo())
                .buildingName(request.getRoom().getBuilding().getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .build();
    }

    public CommonViewDTO.OwnerRoomView toOwnerRoomView(Room room) {
        return CommonViewDTO.OwnerRoomView.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNo())
                .price(room.getPrice())
                .area(room.getArea())
                .status(room.getStatus().name())
                .buildingName(room.getBuilding().getName())
                .buildingId(room.getBuilding().getId())
                .build();
    }

    public CommonViewDTO.MeterReadingView toMeterReadingView(MeterReading reading) {
        return CommonViewDTO.MeterReadingView.builder()
                .id(reading.getId())
                .roomNumber(reading.getRoom().getRoomNo())
                .utilityType(reading.getUtilityType().name())
                .previousReading(reading.getPreviousReading())
                .currentReading(reading.getCurrentReading())
                .unitPrice(reading.getUnitPrice())
                .recordedAt(reading.getRecordedAt())
                .recordedByName(reading.getRecordedBy().getFullName())
                .build();
    }

    public CommonViewDTO.ManagerBuildingView toManagerBuildingView(Building building) {
        return CommonViewDTO.ManagerBuildingView.builder()
                .id(building.getId())
                .name(building.getName())
                .address(building.getAddress())
                .publishStatus(building.getPublishStatus())
                .build();
    }

    public CommonViewDTO.ManagerRoomView toManagerRoomView(Room room) {
        return CommonViewDTO.ManagerRoomView.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNo())
                .price(room.getPrice())
                .area(room.getArea())
                .status(room.getStatus().name())
                .build();
    }

    public CommonViewDTO.ManagerMaintenanceView toManagerMaintenanceView(MaintenanceRequest request) {
        return CommonViewDTO.ManagerMaintenanceView.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus().name())
                .roomNumber(request.getRoom().getRoomNo())
                .tenantName(request.getTenant().getFullName())
                .createdAt(request.getCreatedAt())
                .build();
    }

    public CommonViewDTO.ManagerBillView toManagerBillView(Bill bill) {
        return CommonViewDTO.ManagerBillView.builder()
                .id(bill.getId())
                .tenantName(bill.getContract().getTenant().getFullName())
                .roomNumber(bill.getContract().getRoom().getRoomNo())
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus().name())
                .dueDate(bill.getDueDate())
                .period(bill.getPeriod())
                .build();
    }
}
