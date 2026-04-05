package com.rentalms.controller.v1;

import com.rentalms.config.CurrentUser;
import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.v1.CommonViewDTO;
import com.rentalms.dto.v1.MaintenanceStatusDTO;
import com.rentalms.dto.v1.MeterReadingDTO;
import com.rentalms.dto.v1.PaymentV1DTO;
import com.rentalms.enums.BillStatus;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.service.BillingV1Service;
import com.rentalms.service.BuildingService;
import com.rentalms.service.BuildingAssignmentService;
import com.rentalms.service.MaintenanceService;
import com.rentalms.service.MeterReadingService;
import com.rentalms.service.ViewMapperService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/manager")
@RequiredArgsConstructor
public class V1ManagerController {

    private final CurrentUser currentUser;
    private final BuildingAssignmentService buildingAssignmentService;
    private final BuildingService buildingService;
    private final MeterReadingService meterReadingService;
    private final MaintenanceService maintenanceService;
    private final BillingV1Service billingV1Service;
    private final ViewMapperService viewMapperService;

    @GetMapping("/buildings")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.ManagerBuildingView>>> assignedBuildings() {
        ensureManager();
        return ResponseEntity.ok(ApiResponse.ok(
                buildingAssignmentService.getBuildingsForManager(currentUser.getId()).stream()
                        .map(viewMapperService::toManagerBuildingView)
                        .toList()
        ));
    }

    @GetMapping("/buildings/{buildingId}/rooms")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.ManagerRoomView>>> buildingRooms(@PathVariable Long buildingId) {
        ensureOwnerOrManager();
        return ResponseEntity.ok(ApiResponse.ok(
                buildingService.getManagedRooms(buildingId, currentUser.get()).stream()
                        .map(viewMapperService::toManagerRoomView)
                        .toList()
        ));
    }

    @PostMapping("/meters")
    public ResponseEntity<ApiResponse<CommonViewDTO.MeterReadingView>> recordMeter(@Valid @RequestBody MeterReadingDTO.UpsertRequest request) {
        ensureManager();
        return ResponseEntity.ok(ApiResponse.ok("Nhap chi so thanh cong",
                viewMapperService.toMeterReadingView(
                        meterReadingService.record(request.getRoomId(), request.getPeriod(), request.getUtilityType(),
                                request.getPreviousReading(), request.getCurrentReading(), request.getUnitPrice(),
                                request.getNote(), currentUser.get()))));
    }

    @GetMapping("/buildings/{buildingId}/meters")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.MeterReadingView>>> buildingMeters(@PathVariable Long buildingId,
                                                                                             @RequestParam String period) {
        ensureManager();
        return ResponseEntity.ok(ApiResponse.ok(
                meterReadingService.getByBuildingAndPeriod(buildingId, period, currentUser.get()).stream()
                        .map(viewMapperService::toMeterReadingView)
                        .toList()
        ));
    }

    @GetMapping("/buildings/{buildingId}/meter-readings")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.MeterReadingView>>> buildingMeterReadings(
            @PathVariable Long buildingId,
            @RequestParam(required = false) String period) {
        ensureOwnerOrManager();
        return ResponseEntity.ok(ApiResponse.ok(
                meterReadingService.getByBuildingAndPeriod(buildingId, period, currentUser.get()).stream()
                        .map(viewMapperService::toMeterReadingView)
                        .toList()
        ));
    }

    @GetMapping("/buildings/{buildingId}/maintenance")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.ManagerMaintenanceView>>> buildingMaintenance(
            @PathVariable Long buildingId) {
        ensureOwnerOrManager();
        return ResponseEntity.ok(ApiResponse.ok(
                maintenanceService.getByBuilding(buildingId, currentUser.get()).stream()
                        .map(viewMapperService::toManagerMaintenanceView)
                        .toList()
        ));
    }

    @PatchMapping("/maintenance/{id}/status")
    public ResponseEntity<ApiResponse<CommonViewDTO.ManagerMaintenanceView>> updateMaintenanceStatus(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceStatusDTO.UpdateRequest request) {
        ensureOwnerOrManager();
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat maintenance thanh cong",
                viewMapperService.toManagerMaintenanceView(
                        maintenanceService.updateStatus(id, request.getStatus(), null, null, currentUser.getId())
                )));
    }

    @GetMapping("/buildings/{buildingId}/bills")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.ManagerBillView>>> buildingBills(
            @PathVariable Long buildingId,
            @RequestParam(required = false) String status) {
        ensureOwnerOrManager();
        BillStatus parsedStatus = parseBillStatus(status);
        return ResponseEntity.ok(ApiResponse.ok(
                billingV1Service.getBillsForManagedBuilding(buildingId, parsedStatus, currentUser.get()).stream()
                        .map(viewMapperService::toManagerBillView)
                        .toList()
        ));
    }

    @PostMapping("/bills/{billId}/items")
    public ResponseEntity<ApiResponse<CommonViewDTO.BillView>> addBillItem(@PathVariable Long billId,
                                                                           @RequestBody Map<String, String> body) {
        ensureManager();
        return ResponseEntity.ok(ApiResponse.ok("Them bill item thanh cong",
                viewMapperService.toBillView(
                        billingV1Service.addManualItem(
                                billId,
                                body.get("itemType"),
                                body.get("description"),
                                new java.math.BigDecimal(body.get("amount")),
                                currentUser.get()
                        )
                )));
    }

    @PostMapping("/bills/{billId}/cash-payments")
    public ResponseEntity<ApiResponse<Void>> createCashPending(@PathVariable Long billId,
                                                               @Valid @RequestBody PaymentV1DTO.CashPaymentRequest request) {
        ensureManager();
        billingV1Service.createCashPending(
                billId, request.getAmount(), currentUser.get(),
                request.getPayerName(), request.getPayerPhone(), request.getNote()
        );
        return ResponseEntity.ok(ApiResponse.ok("Tao pending cash payment thanh cong", null));
    }

    @PostMapping("/payments/{paymentId}/confirm-cash")
    public ResponseEntity<ApiResponse<Void>> confirmCash(@PathVariable Long paymentId) {
        ensureManager();
        billingV1Service.confirmCash(paymentId, currentUser.get());
        return ResponseEntity.ok(ApiResponse.ok("Xac nhan tien mat thanh cong", null));
    }

    @PostMapping("/bills/{billId}/cash-confirm")
    public ResponseEntity<ApiResponse<Void>> confirmCashByBill(@PathVariable Long billId) {
        ensureOwnerOrManager();
        billingV1Service.confirmCashByBill(billId, currentUser.get());
        return ResponseEntity.ok(ApiResponse.ok("Xac nhan tien mat thanh cong", null));
    }

    private void ensureManager() {
        if (currentUser.get().getRole() != UserRole.MANAGER) {
            throw new BusinessException("Chi MANAGER moi duoc phep truy cap");
        }
    }

    private void ensureOwnerOrManager() {
        UserRole role = currentUser.get().getRole();
        if (role != UserRole.MANAGER && role != UserRole.OWNER) {
            throw new BusinessException("Chi MANAGER hoac OWNER moi duoc phep truy cap");
        }
    }

    private BillStatus parseBillStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return BillStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status bill khong hop le");
        }
    }
}
