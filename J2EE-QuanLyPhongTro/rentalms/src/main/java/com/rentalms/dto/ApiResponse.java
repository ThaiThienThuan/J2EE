package com.rentalms.dto;

import lombok.Data;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private int status;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return ok("Success", data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.message = message;
        r.data = data;
        r.status = HttpStatus.OK.value();
        r.timestamp = LocalDateTime.now();
        return r;
    }

    public static <T> ApiResponse<T> error(String message) {
        return error(HttpStatus.BAD_REQUEST, message, List.of(message));
    }

    public static <T> ApiResponse<T> error(HttpStatus status, String message, List<String> errors) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.message = message;
        r.errors = errors;
        r.status = status.value();
        r.timestamp = LocalDateTime.now();
        return r;
    }
}
