package com.rentalms.dto.v1;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

public class PaymentV1DTO {

    @Data
    public static class CashPaymentRequest {
        @NotNull
        @Positive
        private BigDecimal amount;
        private String payerName;
        private String payerPhone;
        private String note;
    }

    @Data
    public static class MomoCreateRequest {
        @NotNull
        @Positive
        private BigDecimal amount;
        private String payerName;
        private String note;
    }

    @Data
    public static class MomoIpnRequest {
        private Map<String, String> payload;
    }
}
