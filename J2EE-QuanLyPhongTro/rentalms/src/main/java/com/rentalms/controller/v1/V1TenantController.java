package com.rentalms.controller.v1;

import com.rentalms.config.CurrentUser;
import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.RentalRequestDTO;
import com.rentalms.dto.v1.CommonViewDTO;
import com.rentalms.dto.v1.PaymentV1DTO;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
public class V1TenantController {

    private final CurrentUser currentUser;
    private final RentalRequestService rentalRequestService;
    private final ContractService contractService;
    private final BillingV1Service billingV1Service;
    private final MaintenanceService maintenanceService;
    private final ViewMapperService viewMapperService;
    private final ContractDocService contractDocService;

    @PostMapping("/rental-requests")
    public ResponseEntity<ApiResponse<RentalRequestDTO.Response>> createRentalRequest(@Valid @RequestBody RentalRequestDTO.CreateRequest request) {
        ensureTenant();
        return ResponseEntity.status(201).body(ApiResponse.ok("Gui rental request thanh cong",
                rentalRequestService.apply(request, currentUser.getId())));
    }

    @GetMapping("/rental-requests")
    public ResponseEntity<ApiResponse<List<RentalRequestDTO.Response>>> myRequests() {
        ensureTenant();
        return ResponseEntity.ok(ApiResponse.ok(rentalRequestService.getByTenant(currentUser.getId())));
    }

    @GetMapping("/contracts")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.ContractView>>> myContracts() {
        ensureTenant();
        return ResponseEntity.ok(ApiResponse.ok(
                contractService.getByTenant(currentUser.getId()).stream().map(viewMapperService::toContractView).toList()
        ));
    }

    @GetMapping("/contracts/{id}/download")
    public ResponseEntity<byte[]> downloadContractDocx(@PathVariable Long id) throws Exception {
        ensureTenant();
        contractService.findByIdForTenant(id, currentUser.getId());
        byte[] docx = contractDocService.generateDocx(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=HopDong_" + id + ".docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(docx);
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.BillView>>> myBills() {
        ensureTenant();
        return ResponseEntity.ok(ApiResponse.ok(
                billingV1Service.getBillsForTenant(currentUser.getId()).stream().map(viewMapperService::toBillView).toList()
        ));
    }

    @PostMapping("/bills/{billId}/cash-payments")
    public ResponseEntity<ApiResponse<Void>> createCashPayment(@PathVariable Long billId,
                                                               @Valid @RequestBody PaymentV1DTO.CashPaymentRequest request) {
        ensureTenant();
        billingV1Service.createCashPending(
                billId, request.getAmount(), currentUser.get(), request.getPayerName(), request.getPayerPhone(), request.getNote()
        );
        return ResponseEntity.ok(ApiResponse.ok("Gui yeu cau thanh toan tien mat thanh cong", null));
    }

    @GetMapping("/credits")
    public ResponseEntity<ApiResponse<BigDecimal>> myCredit() {
        ensureTenant();
        return ResponseEntity.ok(ApiResponse.ok(billingV1Service.getAvailableCredit(currentUser.getId())));
    }

    @GetMapping("/maintenance")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.MaintenanceView>>> myMaintenance() {
        ensureTenant();
        return ResponseEntity.ok(ApiResponse.ok(
                maintenanceService.getByTenant(currentUser.getId()).stream()
                        .map(viewMapperService::toMaintenanceView)
                        .toList()
        ));
    }

    @PostMapping("/maintenance")
    public ResponseEntity<ApiResponse<CommonViewDTO.MaintenanceView>> createMaintenance(@RequestBody Map<String, Object> body) {
        ensureTenant();
        Long roomId = body.get("roomId") != null ? Long.valueOf(body.get("roomId").toString()) : null;
        return ResponseEntity.status(201).body(ApiResponse.ok("Gui maintenance thanh cong",
                viewMapperService.toMaintenanceView(maintenanceService.create(roomId,
                        body.get("title") != null ? body.get("title").toString() : null,
                        body.get("description").toString(),
                        body.getOrDefault("priority", "MEDIUM").toString(),
                        body.get("imageUrl") != null ? body.get("imageUrl").toString() : null,
                        currentUser.getId()))));
    }

    private void ensureTenant() {
        if (currentUser.get().getRole() != UserRole.TENANT) {
            throw new BusinessException("Chi TENANT moi duoc phep truy cap");
        }
    }
}
