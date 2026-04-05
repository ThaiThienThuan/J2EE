package com.rentalms.controller.v1;

import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.v1.PaymentV1DTO;
import com.rentalms.service.BillingV1Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments/momo")
@RequiredArgsConstructor
public class V1PaymentController {

    private final BillingV1Service billingV1Service;

    private static Map<String, String> momoCallbackToStringMap(Map<String, Object> body) {
        Map<String, String> out = new HashMap<>();
        if (body == null) {
            return out;
        }
        for (Map.Entry<String, Object> e : body.entrySet()) {
            Object v = e.getValue();
            out.put(e.getKey(), v == null ? "" : String.valueOf(v));
        }
        return out;
    }

    @PostMapping("/bills/{billId}/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMomoPayment(
            @PathVariable Long billId,
            @Valid @RequestBody PaymentV1DTO.MomoCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tao lenh thanh toan MoMo thanh cong",
                billingV1Service.createMomoPayment(billId, request.getAmount(), request.getPayerName(), request.getNote())));
    }

    @PostMapping("/ipn")
    public ResponseEntity<ApiResponse<?>> handleIpn(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok("IPN processed",
                billingV1Service.handleMomoIpn(momoCallbackToStringMap(body))));
    }
}
