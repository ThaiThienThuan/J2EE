package com.rentalms.dto.v1;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class ManagerAssignmentDTO {

    @Data
    public static class AssignRequest {
        @NotNull
        private Long managerId;
    }
}
