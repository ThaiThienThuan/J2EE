package com.rentalms.dto.v1;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

public class ContractActivationDTO {

    @Data
    public static class ActivateRequest {
        private String note;
    }

    @Data
    public static class RenewRequest {
        @NotNull
        @Future
        private LocalDate newEndDate;
    }
}
