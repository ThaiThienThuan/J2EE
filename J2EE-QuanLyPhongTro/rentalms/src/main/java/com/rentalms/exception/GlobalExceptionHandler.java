package com.rentalms.exception;

import com.rentalms.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage(), List.of(e.getMessage())));
    }

    @ExceptionHandler(MomoIpnSignatureException.class)
    public ResponseEntity<ApiResponse<?>> handleMomoIpnSignature(MomoIpnSignatureException e) {
        String message = e.getMessage() != null ? e.getMessage() : "Chu ky MoMo IPN khong hop le";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(HttpStatus.BAD_REQUEST, message, List.of(message)));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusiness(BusinessException e) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String message = e.getMessage() != null ? e.getMessage() : "Business error";
        String normalized = message.toLowerCase();
        if (normalized.contains("khong co quyen") || normalized.contains("không có quyền")) {
            status = HttpStatus.FORBIDDEN;
        } else if (normalized.contains("khong hop le") || normalized.contains("không hợp lệ")) {
            status = HttpStatus.UNPROCESSABLE_ENTITY;
        } else if (normalized.contains("da ton tai") || normalized.contains("đã tồn tại")
                || normalized.contains("conflict")) {
            status = HttpStatus.CONFLICT;
        }
        return ResponseEntity.status(status)
                .body(ApiResponse.error(status, message, List.of(message)));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccess(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(HttpStatus.FORBIDDEN, "Khong co quyen truy cap",
                        List.of("Khong co quyen truy cap")));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error(HttpStatus.UNPROCESSABLE_ENTITY, "Du lieu khong hop le", errors));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentials(BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(HttpStatus.UNAUTHORIZED, "Thong tin dang nhap khong dung",
                        List.of("Thong tin dang nhap khong dung")));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneral(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Loi he thong: " + e.getMessage(),
                        List.of(e.getMessage())));
    }
}
