package com.rentalms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/app")
    public RedirectView app() {
        return new RedirectView("/home");
    }


    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("app", "RentalMS - He thong Quan ly Phong Tro");
        info.put("version", "2.0.0");
        info.put("apiV1", "http://localhost:8080/api/v1");
        info.put("frontendSpa", "http://localhost:3000");

        Map<String, String> accounts = new LinkedHashMap<>();
        accounts.put("admin", "admin@rentalms.com / admin123");
        accounts.put("owner", "owner@rentalms.com / owner123");
        accounts.put("manager", "manager1@rentalms.com / manager123");
        accounts.put("tenant1", "tenant1@rentalms.com / tenant123");
        accounts.put("tenant2", "tenant2@rentalms.com / tenant123");
        info.put("demoAccounts", accounts);

        Map<String, String> apis = new LinkedHashMap<>();
        apis.put("POST /api/v1/auth/register", "Dang ky tenant");
        apis.put("POST /api/v1/auth/login", "Dang nhap JWT");
        apis.put("GET  /api/v1/marketplace/buildings", "Marketplace public");
        apis.put("GET  /api/v1/profile/me", "Thong tin profile hien tai");
        apis.put("GET  /api/v1/owner/buildings", "OWNER xem building");
        apis.put("POST /api/v1/owner/buildings/{id}/assignments", "OWNER gan manager vao building");
        apis.put("POST /api/v1/owner/contracts/{id}/activate", "OWNER offline confirm contract active");
        apis.put("POST /api/v1/owner/bills/generate/{contractId}", "OWNER tao hoa don");
        apis.put("GET  /api/v1/manager/buildings", "MANAGER xem building duoc assign");
        apis.put("POST /api/v1/manager/meters", "MANAGER nhap chi so dien nuoc");
        apis.put("GET  /api/v1/tenant/bills", "TENANT xem bill cua minh");
        apis.put("POST /api/v1/payments/momo/bills/{id}/create", "Tao lenh MoMo sandbox");
        apis.put("POST /api/auth/register", "Dang ky tai khoan moi");
        apis.put("POST /api/auth/login", "Dang nhap - nhan JWT token");
        apis.put("GET  /api/buildings", "Danh sach khu tro (Owner)");
        apis.put("POST /api/buildings", "Tao khu tro moi (Owner)");
        apis.put("POST /api/buildings/{id}/rooms", "Tao phong (Owner)");
        apis.put("POST /api/buildings/{id}/rooms/bulk", "Tao nhieu phong (Owner)");
        apis.put("PUT  /api/buildings/{id}/shape", "Cap nhat GeoJSON polygon (Owner)");
        apis.put("PUT  /api/buildings/{id}/publish", "Public/Private khu tro (Owner)");
        apis.put("POST /api/contracts", "Tao hop dong (Owner)");
        apis.put("GET  /api/contracts", "Danh sach hop dong");
        apis.put("PUT  /api/contracts/{id}/terminate", "Ket thuc hop dong (Owner)");
        apis.put("PUT  /api/contracts/{id}/renew", "Gia han hop dong (Owner)");
        apis.put("GET  /api/bills", "Xem hoa don cua toi (Tenant)");
        apis.put("POST /api/bills/{id}/pay", "Thanh toan hoa don (Tenant)");
        apis.put("POST /api/bills/{id}/items", "Them khoan phi (Owner/Manager)");
        apis.put("POST /api/maintenance", "Gui yeu cau bao tri (Tenant)");
        apis.put("GET  /api/maintenance/building/{id}", "Xem bao tri cua building (Owner)");
        apis.put("PUT  /api/maintenance/{id}/status", "Cap nhat bao tri (Manager)");
        apis.put("GET  /api/marketplace", "Tim kiem phong public (Public)");
        info.put("endpoints", apis);

        info.put("note", "Dung Authorization: Bearer {token} trong header cho cac API can xac thuc. API cu van duoc giu de migration, API moi nam duoi /api/v1.");
        return info;
    }
}
