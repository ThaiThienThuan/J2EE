package com.rentalms.dto.v1;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class MaintenanceStatusDTO {

    @Data
    public static class UpdateRequest {
        @NotBlank
        private String status;
    }
}
