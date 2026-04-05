package com.rentalms.controller.v1;

import com.rentalms.config.CurrentUser;
import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.ProfileDTO;
import com.rentalms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class V1ProfileController {

    private final CurrentUser currentUser;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileDTO.Response>> me() {
        return ResponseEntity.ok(ApiResponse.ok(userService.toProfileResponse(userService.findById(currentUser.getId()))));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<ProfileDTO.Response>> update(@Valid @RequestBody ProfileDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat profile thanh cong",
                userService.toProfileResponse(userService.updateProfile(currentUser.getId(), request))));
    }
}
