package com.rentalms.controller.v1;

import com.rentalms.config.CurrentUser;
import com.rentalms.dto.ApiResponse;
import com.rentalms.entity.Notification;
import com.rentalms.entity.User;
import com.rentalms.enums.UserRole;
import com.rentalms.exception.BusinessException;
import com.rentalms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class V1NotificationController {

    private final CurrentUser currentUser;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> myNotifications() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications(currentUser.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationForRecipient(id, currentUser.getId());
        notificationService.markAsRead(notification, currentUser.get());
        return ResponseEntity.ok(ApiResponse.ok("Da danh dau da doc", null));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<Void>> broadcast(@RequestBody Map<String, String> body) {
        User actor = currentUser.get();
        if (actor.getRole() != UserRole.OWNER && actor.getRole() != UserRole.MANAGER) {
            throw new BusinessException("Chi OWNER hoac MANAGER moi co the gui notification tenant");
        }
        notificationService.broadcastSystemAnnouncement(body.get("title"), body.get("message"), actor);
        return ResponseEntity.ok(ApiResponse.ok("Da gui thong bao", null));
    }

    @PostMapping("/bug-report")
    public ResponseEntity<ApiResponse<Void>> bugReport(@RequestBody Map<String, String> body) {
        notificationService.submitBugReport(body.get("title"), body.get("message"), currentUser.get());
        return ResponseEntity.ok(ApiResponse.ok("Da gui bug report", null));
    }
}
