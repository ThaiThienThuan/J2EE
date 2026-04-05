package com.rentalms.controller.v1;

import com.rentalms.dto.ApiResponse;
import com.rentalms.dto.AuthDTO;
import com.rentalms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class V1AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.ok("Dang ky tenant thanh cong", userService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Dang nhap thanh cong", userService.login(request)));
    }
}
