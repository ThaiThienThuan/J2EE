package com.rentalms.controller.v1;

import com.rentalms.config.CurrentUser;
import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.ContractDTO;
import com.rentalms.dto.RentalRequestDTO;
import com.rentalms.dto.v1.CommonViewDTO;
import com.rentalms.dto.v1.ContractActivationDTO;
import com.rentalms.dto.v1.ManagerAssignmentDTO;
import com.rentalms.enums.BillStatus;
import com.rentalms.enums.ContractStatus;
import com.rentalms.enums.RentalRequestStatus;
import com.rentalms.enums.RoomStatus;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.dto.BuildingDTO;
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
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
public class V1OwnerController {

    private final CurrentUser currentUser;
    private final BuildingService buildingService;
    private final BuildingAssignmentService buildingAssignmentService;
    private final RentalRequestService rentalRequestService;
    private final ContractService contractService;
    private final BillingV1Service billingV1Service;
    private final ViewMapperService viewMapperService;
    private final UserService userService;
    private final ContractDocService contractDocService;

    @GetMapping("/buildings")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.BuildingSummary>>> buildings() {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok(buildingService.getByOwner(currentUser.getId()).stream()
                .map(viewMapperService::toBuildingSummary).toList()));
    }

    @GetMapping("/buildings/{id}")
    public ResponseEntity<ApiResponse<CommonViewDTO.BuildingDetailView>> buildingDetail(@PathVariable Long id) {
        ensureOwner();
        var building = buildingService.getOwnerBuildingDetail(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(
                viewMapperService.toBuildingDetailView(building, buildingService.countRooms(id))
        ));
    }

    @PostMapping("/buildings")
    public ResponseEntity<ApiResponse<CommonViewDTO.BuildingSummary>> createBuilding(@Valid @RequestBody BuildingDTO.CreateRequest request) {
        ensureOwner();
        return ResponseEntity.status(201).body(ApiResponse.ok("Tao building thanh cong",
                viewMapperService.toBuildingSummary(buildingService.create(request, currentUser.getId()))));
    }

    @PostMapping("/buildings/{buildingId}/rooms")
    public ResponseEntity<ApiResponse<CommonViewDTO.OwnerRoomView>> createRoom(
            @PathVariable Long buildingId,
            @Valid @RequestBody BuildingDTO.RoomCreateRequest request) {
        ensureOwner();
        return ResponseEntity.status(201).body(ApiResponse.ok("Tao phong thanh cong",
                viewMapperService.toOwnerRoomView(
                        buildingService.createRoom(buildingId, request, currentUser.getId()))));
    }

    @GetMapping("/available-managers")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.OwnerAvailableManagerView>>> availableManagers() {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok(
                userService.findActiveManagers().stream()
                        .map(viewMapperService::toOwnerAvailableManagerView)
                        .toList()
        ));
    }

    @PostMapping("/buildings/{buildingId}/assignments")
    public ResponseEntity<ApiResponse<CommonViewDTO.ManagerAssignmentView>> assignManager(
            @PathVariable Long buildingId,
            @Valid @RequestBody ManagerAssignmentDTO.AssignRequest request) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok("Gan manager thanh cong",
                viewMapperService.toAssignmentView(
                        buildingAssignmentService.assignManager(buildingId, request.getManagerId(), currentUser.getId())
                )));
    }

    @GetMapping("/buildings/{buildingId}/assignments")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.ManagerAssignmentView>>> buildingAssignments(@PathVariable Long buildingId) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok(buildingAssignmentService.getActiveAssignmentsForOwnerBuilding(buildingId, currentUser.get()).stream()
                .map(viewMapperService::toAssignmentView).toList()));
    }

    @GetMapping("/buildings/{buildingId}/managers")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.OwnerManagerView>>> managers(@PathVariable Long buildingId) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok(
                buildingAssignmentService.getActiveAssignmentsForOwnerBuilding(buildingId, currentUser.get()).stream()
                        .map(viewMapperService::toOwnerManagerView)
                        .toList()
        ));
    }

    @DeleteMapping("/buildings/{buildingId}/assignments/{managerId}")
    public ResponseEntity<ApiResponse<Void>> unassignManager(@PathVariable Long buildingId, @PathVariable Long managerId) {
        ensureOwner();
        buildingAssignmentService.unassignManager(buildingId, managerId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Go manager thanh cong", null));
    }

    @PostMapping("/contracts")
    public ResponseEntity<ApiResponse<CommonViewDTO.ContractView>> createContract(@Valid @RequestBody ContractDTO.CreateRequest request) {
        ensureOwner();
        return ResponseEntity.status(201).body(ApiResponse.ok("Tao contract pending activation thanh cong",
                viewMapperService.toContractView(contractService.create(request, currentUser.getId()))));
    }

    @GetMapping("/rental-requests")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.OwnerRentalRequestView>>> rentalRequests(
            @RequestParam(required = false) String status) {
        ensureOwner();
        RentalRequestStatus parsedStatus = parseRentalRequestStatus(status);
        return ResponseEntity.ok(ApiResponse.ok(
                rentalRequestService.getByOwner(currentUser.getId(), parsedStatus).stream()
                        .map(viewMapperService::toOwnerRentalRequestView)
                        .toList()
        ));
    }

    @PutMapping("/rental-requests/{id}/approve")
    public ResponseEntity<ApiResponse<RentalRequestDTO.Response>> approveRentalRequest(@PathVariable Long id) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok("Duyet rental request thanh cong",
                rentalRequestService.approve(id, currentUser.getId())));
    }

    @PutMapping("/rental-requests/{id}/reject")
    public ResponseEntity<ApiResponse<RentalRequestDTO.Response>> rejectRentalRequest(@PathVariable Long id) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok("Tu choi rental request thanh cong",
                rentalRequestService.reject(id, currentUser.getId())));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.OwnerRoomView>>> rooms(
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) String status) {
        ensureOwner();
        RoomStatus parsedStatus = parseRoomStatus(status);
        return ResponseEntity.ok(ApiResponse.ok(
                buildingService.getOwnerRooms(currentUser.getId(), buildingId, parsedStatus).stream()
                        .map(viewMapperService::toOwnerRoomView)
                        .toList()
        ));
    }

    @GetMapping("/contracts")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.OwnerContractView>>> contracts(
            @RequestParam(required = false) String status) {
        ensureOwner();
        ContractStatus parsedStatus = parseContractStatus(status);
        return ResponseEntity.ok(ApiResponse.ok(
                contractService.getByOwner(currentUser.getId(), parsedStatus).stream()
                        .map(viewMapperService::toOwnerContractView)
                        .toList()
        ));
    }

    @GetMapping("/contracts/{id}/download")
    public ResponseEntity<byte[]> downloadContractDocx(@PathVariable Long id) throws Exception {
        ensureOwner();
        contractService.findByIdForOwner(id, currentUser.getId());
        byte[] docx = contractDocService.generateDocx(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=HopDong_" + id + ".docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(docx);
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<CommonViewDTO.OwnerBillView>>> bills(
            @RequestParam(required = false) String status) {
        ensureOwner();
        BillStatus parsedStatus = parseBillStatus(status);
        return ResponseEntity.ok(ApiResponse.ok(
                billingV1Service.getBillsForOwner(currentUser.getId(), parsedStatus).stream()
                        .map(viewMapperService::toOwnerBillView)
                        .toList()
        ));
    }

    @PostMapping("/contracts/{id}/activate")
    public ResponseEntity<ApiResponse<CommonViewDTO.ContractView>> activateContract(@PathVariable Long id) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok("Kich hoat contract thanh cong",
                viewMapperService.toContractView(contractService.confirmActivation(id, currentUser.getId()))));
    }

    @PutMapping("/contracts/{id}/terminate")
    public ResponseEntity<ApiResponse<CommonViewDTO.ContractView>> terminateContract(@PathVariable Long id) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok("Ket thuc contract thanh cong",
                viewMapperService.toContractView(contractService.terminate(id, currentUser.getId()))));
    }

    @PutMapping("/contracts/{id}/renew")
    public ResponseEntity<ApiResponse<CommonViewDTO.ContractView>> renewContract(
            @PathVariable Long id,
            @Valid @RequestBody ContractActivationDTO.RenewRequest request) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok("Gia han contract thanh cong",
                viewMapperService.toContractView(contractService.renew(id, request.getNewEndDate(), currentUser.getId()))));
    }

    @PostMapping("/bills/generate/{contractId}")
    public ResponseEntity<ApiResponse<CommonViewDTO.BillView>> generateBill(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body) {
        ensureOwner();
        String period = body != null ? body.getOrDefault("period", java.time.LocalDate.now().toString().substring(0, 7))
                : java.time.LocalDate.now().toString().substring(0, 7);
        return ResponseEntity.ok(ApiResponse.ok("Tao hoa don thanh cong",
                viewMapperService.toBillView(billingV1Service.generateBill(contractId, period, currentUser.get()))));
    }

    @PostMapping("/payments/{paymentId}/confirm-cash")
    public ResponseEntity<ApiResponse<Void>> confirmCash(@PathVariable Long paymentId) {
        ensureOwner();
        billingV1Service.confirmCash(paymentId, currentUser.get());
        return ResponseEntity.ok(ApiResponse.ok("Xac nhan tien mat thanh cong", null));
    }

    @GetMapping("/credits/{tenantId}")
    public ResponseEntity<ApiResponse<BigDecimal>> credit(@PathVariable Long tenantId) {
        ensureOwner();
        return ResponseEntity.ok(ApiResponse.ok(billingV1Service.getAvailableCredit(tenantId)));
    }

    private void ensureOwner() {
        if (currentUser.get().getRole() != UserRole.OWNER) {
            throw new BusinessException("Chi OWNER moi duoc phep truy cap");
        }
    }

    private RentalRequestStatus parseRentalRequestStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return RentalRequestStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status rental request khong hop le");
        }
    }

    private RoomStatus parseRoomStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return RoomStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status room khong hop le");
        }
    }

    private ContractStatus parseContractStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return ContractStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status contract khong hop le");
        }
    }

    private BillStatus parseBillStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return BillStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Status bill khong hop le");
        }
    }
}
