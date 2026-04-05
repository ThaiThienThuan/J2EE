package com.rentalms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URI;
import java.util.List;

/**
 * CORS: localhost + mọi deployment Vercel (https + host kết thúc .vercel.app) +
 * thêm pattern/URL từ APP_CORS_ALLOWED_ORIGIN_PATTERNS.
 */
@Component
public class RentalmsCorsConfigurationSource implements CorsConfigurationSource {

    @Value("${app.cors.allowed-origin-patterns:}")
    private String extraOriginPatterns;

    @Override
    @Nullable
    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
        String origin = request.getHeader(HttpHeaders.ORIGIN);
        if (!StringUtils.hasText(origin)) {
            return null;
        }
        if (!isOriginAllowed(origin)) {
            return null;
        }
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(origin));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        return cfg;
    }

    private boolean isOriginAllowed(String origin) {
        if (isLocalDevOrigin(origin)) {
            return true;
        }
        if (isVercelHttpsOrigin(origin)) {
            return true;
        }
        if (!StringUtils.hasText(extraOriginPatterns)) {
            return false;
        }
        for (String part : extraOriginPatterns.split(",")) {
            String p = part.trim();
            if (p.isEmpty()) {
                continue;
            }
            CorsConfiguration probe = new CorsConfiguration();
            if (p.contains("*")) {
                probe.addAllowedOriginPattern(p);
            } else {
                probe.setAllowedOrigins(List.of(p));
            }
            if (probe.checkOrigin(origin) != null) {
                return true;
            }
        }
        return false;
    }

    private static boolean isLocalDevOrigin(String origin) {
        try {
            URI u = URI.create(origin);
            if (!"http".equalsIgnoreCase(u.getScheme())) {
                return false;
            }
            String host = u.getHost();
            if (host == null) {
                return false;
            }
            if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host)) {
                return false;
            }
            int port = u.getPort();
            return port == -1 || (port >= 1 && port <= 65535);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /** Preview + production Vercel: một label hoặc nhiều label đều kết thúc .vercel.app */
    private static boolean isVercelHttpsOrigin(String origin) {
        try {
            URI u = URI.create(origin);
            if (!"https".equalsIgnoreCase(u.getScheme())) {
                return false;
            }
            String host = u.getHost();
            if (host == null || host.isEmpty()) {
                return false;
            }
            String h = host.toLowerCase();
            return h.equals("vercel.app") || h.endsWith(".vercel.app");
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
