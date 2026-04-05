package com.rentalms.controller.v1;

import com.rentalms.config.CurrentUser;
import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.ProfileDTO;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.service.AuditService;
import com.rentalms.service.ReportService;
import com.rentalms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class V1AdminController {

    private final CurrentUser currentUser;
    private final UserService userService;
    private final AuditService auditService;
    private final ReportService reportService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<ProfileDTO.Response>>> users(@RequestParam(required = false) String role) {
        ensureAdmin();
        if (role == null || role.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
        }
        return ResponseEntity.ok(ApiResponse.ok(userService.getUsersByRole(UserRole.valueOf(role.toUpperCase()))));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<com.rentalms.entity.AuditLog>>> auditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ensureAdmin();
        return ResponseEntity.ok(ApiResponse.ok(auditService.getFiltered(action, entityType, actorId, from, to, page, size)));
    }

    @GetMapping("/reports/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reportOverview() {
        ensureAdmin();
        return ResponseEntity.ok(ApiResponse.ok(reportService.getOverviewReport()));
    }

    private void ensureAdmin() {
        if (currentUser.get().getRole() != UserRole.ADMIN) {
            throw new BusinessException("Chi ADMIN moi duoc phep truy cap");
        }
    }
}
