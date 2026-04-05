package com.rentalms.dto.v1;

import com.rentalms.enums.UtilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

public class MeterReadingDTO {

    @Data
    public static class UpsertRequest {
        @NotNull
        private Long roomId;
        @NotBlank
        private String period;
        @NotNull
        private UtilityType utilityType;
        @NotNull
        private Double previousReading;
        @NotNull
        private Double currentReading;
        @NotNull
        private BigDecimal unitPrice;
        private String note;
    }
}
