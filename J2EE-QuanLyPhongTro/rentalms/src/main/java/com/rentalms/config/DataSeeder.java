package com.rentalms.config;

import com.rentalms.entity.*;
import com.rentalms.enums.*;
import com.rentalms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final BuildingRepository buildingRepo;
    private final RoomRepository roomRepo;
    private final ContractRepository contractRepo;
    private final BillRepository billRepo;
    private final BillItemRepository billItemRepo;
    private final BuildingManagerAssignmentRepository assignmentRepo;
    private final RentalRequestRepository rentalRequestRepo;
    private final MeterReadingRepository meterReadingRepo;
    private final MaintenanceRequestRepository maintenanceRepo;
    private final NotificationRepository notificationRepo;
    private final PasswordEncoder encoder;

    private static final DateTimeFormatter PERIOD_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    @Override
    public void run(String... args) {
        if (userRepo.findByEmail("owner@rentalms.com").isPresent()) {
            return;
        }

        log.info("=== Seeding demo data ===");

        userRepo.save(User.builder()
                .email("admin@rentalms.com").passwordHash(encoder.encode("admin123"))
                .fullName("Admin He Thong").role(UserRole.ADMIN).active(true).build());

        User owner = userRepo.save(User.builder()
                .email("owner@rentalms.com").passwordHash(encoder.encode("owner123"))
                .fullName("Nguyen Van A (Chu tro)").phone("0901234567")
                .role(UserRole.OWNER).active(true).build());

        User manager1 = userRepo.save(User.builder()
                .email("manager1@rentalms.com").passwordHash(encoder.encode("manager123"))
                .fullName("Tran Thi Manager Mot").phone("0902345678")
                .role(UserRole.MANAGER).active(true).build());

        User manager2 = userRepo.save(User.builder()
                .email("manager2@rentalms.com").passwordHash(encoder.encode("manager123"))
                .fullName("Pham Van Manager Hai").phone("0902345679")
                .role(UserRole.MANAGER).active(true).build());

        User tenant1 = userRepo.save(User.builder()
                .email("tenant1@rentalms.com").passwordHash(encoder.encode("tenant123"))
                .fullName("Le Van Tenant Mot").phone("0903456789")
                .role(UserRole.TENANT).active(true).build());

        User tenant2 = userRepo.save(User.builder()
                .email("tenant2@rentalms.com").passwordHash(encoder.encode("tenant123"))
                .fullName("Ho Thi Tenant Hai").phone("0904567890")
                .role(UserRole.TENANT).active(true).build());

        User tenant3 = userRepo.save(User.builder()
                .email("tenant3@rentalms.com").passwordHash(encoder.encode("tenant123"))
                .fullName("Vo Van Tenant Ba").phone("0905678901")
                .role(UserRole.TENANT).active(true).build());

        Building b1 = buildingRepo.save(Building.builder()
                .name("Khu Tro Binh Thanh A").address("123 Duong Binh Loi, Binh Thanh, TP.HCM")
                .description("Khu tro 3 tang, gan truong dai hoc, day du tien nghi")
                .publishStatus("PUBLIC")
                .shapeGeoJson("{\"type\":\"Polygon\",\"coordinates\":[[[106.7,10.8],[106.71,10.8],[106.71,10.81],[106.7,10.81],[106.7,10.8]]]}")
                .owner(owner).build());

        Building b2 = buildingRepo.save(Building.builder()
                .name("Khu Tro Thu Duc B").address("456 Duong Linh Trung, Thu Duc, TP.HCM")
                .description("Khu tro moi xay, gan cac khu cong nghiep")
                .publishStatus("PUBLIC")
                .owner(owner).build());

        assignmentRepo.save(BuildingManagerAssignment.builder().building(b1).manager(manager1).active(true).build());
        assignmentRepo.save(BuildingManagerAssignment.builder().building(b2).manager(manager2).active(true).build());

        BigDecimal[] prices = {
                new BigDecimal("2000000"), new BigDecimal("2500000"),
                new BigDecimal("3000000"), new BigDecimal("3500000")
        };
        Double[] areas = {18.0, 20.0, 25.0, 30.0};

        Room r101 = roomRepo.save(room(b1, "101", prices[1], areas[1], RoomStatus.OCCUPIED, 1));
        Room r102 = roomRepo.save(room(b1, "102", prices[0], areas[0], RoomStatus.AVAILABLE, 1));
        Room r103 = roomRepo.save(room(b1, "103", prices[2], areas[2], RoomStatus.AVAILABLE, 1));
        Room r104 = roomRepo.save(room(b1, "104", prices[3], areas[3], RoomStatus.MAINTENANCE, 1));
        Room r201 = roomRepo.save(room(b1, "201", prices[2], areas[2], RoomStatus.OCCUPIED, 1));
        Room r202 = roomRepo.save(room(b1, "202", prices[0], areas[0], RoomStatus.AVAILABLE, 1));
        Room r203 = roomRepo.save(room(b1, "203", prices[1], areas[1], RoomStatus.AVAILABLE, 1));
        Room r204 = roomRepo.save(room(b1, "204", prices[3], areas[3], RoomStatus.AVAILABLE, 1));
        Room r301 = roomRepo.save(room(b1, "301", prices[0], areas[1], RoomStatus.AVAILABLE, 1));
        Room r302 = roomRepo.save(room(b1, "302", prices[2], areas[0], RoomStatus.AVAILABLE, 1));
        Room r303 = roomRepo.save(room(b1, "303", prices[1], areas[2], RoomStatus.AVAILABLE, 1));
        Room r304 = roomRepo.save(room(b1, "304", prices[3], areas[3], RoomStatus.AVAILABLE, 1));

        for (int i = 1; i <= 6; i++) {
            int pi = (i - 1) % 4;
            roomRepo.save(room(b2, "B0" + i, prices[pi], areas[pi], RoomStatus.AVAILABLE, 1));
        }

        LocalDate now = LocalDate.now();
        Contract c1 = contractRepo.save(Contract.builder()
                .room(r101).tenant(tenant1).owner(owner)
                .startDate(now.minusMonths(3))
                .endDate(now.plusMonths(9))
                .deposit(new BigDecimal("5000000"))
                .monthlyRent(new BigDecimal("2500000"))
                .rentCycle("MONTHLY")
                .policy("Tra tien truoc ngay 5 moi thang. Phat 5% neu tre han.")
                .lateFeePercent(0.05)
                .activationConfirmed(true)
                .status(ContractStatus.ACTIVE)
                .build());

        Contract c2 = contractRepo.save(Contract.builder()
                .room(r201).tenant(tenant2).owner(owner)
                .startDate(now.minusMonths(1))
                .endDate(now.plusMonths(11))
                .deposit(new BigDecimal("6000000"))
                .monthlyRent(new BigDecimal("3000000"))
                .rentCycle("MONTHLY")
                .policy("Tra tien truoc ngay 5 moi thang. Phat 5% neu tre han.")
                .lateFeePercent(0.05)
                .activationConfirmed(true)
                .status(ContractStatus.ACTIVE)
                .build());

        String currentPeriod = YearMonth.now().format(PERIOD_FMT);
        String prevPeriod = YearMonth.now().minusMonths(1).format(PERIOD_FMT);

        Bill billT1Current = billRepo.save(Bill.builder()
                .contract(c1)
                .period(currentPeriod)
                .dueDate(now.plusDays(10))
                .status(BillStatus.UNPAID)
                .totalAmount(new BigDecimal("3150000"))
                .paidAmount(BigDecimal.ZERO)
                .outstandingAmount(new BigDecimal("3150000"))
                .lateFee(BigDecimal.ZERO)
                .creditApplied(BigDecimal.ZERO)
                .creditGenerated(BigDecimal.ZERO)
                .build());

        billItemRepo.save(BillItem.builder().bill(billT1Current).itemType("RENT")
                .description("Tien thue thang " + currentPeriod)
                .amount(new BigDecimal("2500000")).build());
        billItemRepo.save(BillItem.builder().bill(billT1Current).itemType("ELECTRICITY")
                .description("Tien dien (150 so x 3.500d)")
                .amount(new BigDecimal("525000"))
                .previousReading(100.0).currentReading(250.0)
                .unitPrice(new BigDecimal("3500")).build());
        billItemRepo.save(BillItem.builder().bill(billT1Current).itemType("WATER")
                .description("Tien nuoc")
                .amount(new BigDecimal("125000"))
                .previousReading(10.0).currentReading(18.0)
                .unitPrice(new BigDecimal("15000")).build());

        Bill billT1Prev = billRepo.save(Bill.builder()
                .contract(c1)
                .period(prevPeriod)
                .dueDate(now.minusMonths(1).plusDays(10))
                .status(BillStatus.PAID)
                .totalAmount(new BigDecimal("3150000"))
                .paidAmount(new BigDecimal("3150000"))
                .outstandingAmount(BigDecimal.ZERO)
                .lateFee(BigDecimal.ZERO)
                .creditApplied(BigDecimal.ZERO)
                .creditGenerated(BigDecimal.ZERO)
                .build());

        billItemRepo.save(BillItem.builder().bill(billT1Prev).itemType("RENT")
                .description("Tien thue thang " + prevPeriod)
                .amount(new BigDecimal("2500000")).build());
        billItemRepo.save(BillItem.builder().bill(billT1Prev).itemType("ELECTRICITY")
                .description("Tien dien")
                .amount(new BigDecimal("525000")).build());
        billItemRepo.save(BillItem.builder().bill(billT1Prev).itemType("WATER")
                .description("Tien nuoc")
                .amount(new BigDecimal("125000")).build());

        Bill billT2Current = billRepo.save(Bill.builder()
                .contract(c2)
                .period(currentPeriod)
                .dueDate(now.plusDays(10))
                .status(BillStatus.UNPAID)
                .totalAmount(new BigDecimal("3500000"))
                .paidAmount(BigDecimal.ZERO)
                .outstandingAmount(new BigDecimal("3500000"))
                .lateFee(BigDecimal.ZERO)
                .creditApplied(BigDecimal.ZERO)
                .creditGenerated(BigDecimal.ZERO)
                .build());

        billItemRepo.save(BillItem.builder().bill(billT2Current).itemType("RENT")
                .description("Tien thue thang " + currentPeriod)
                .amount(new BigDecimal("3000000")).build());
        billItemRepo.save(BillItem.builder().bill(billT2Current).itemType("ELECTRICITY")
                .description("Tien dien")
                .amount(new BigDecimal("350000")).build());
        billItemRepo.save(BillItem.builder().bill(billT2Current).itemType("WATER")
                .description("Tien nuoc")
                .amount(new BigDecimal("150000")).build());

        rentalRequestRepo.save(RentalRequest.builder()
                .room(r102).tenant(tenant3)
                .startDate(now.plusWeeks(1))
                .endDate(now.plusMonths(12))
                .note("Dang ky thue phong 102 - Binh Thanh")
                .status(RentalRequestStatus.PENDING)
                .build());

        rentalRequestRepo.save(RentalRequest.builder()
                .room(r302).tenant(tenant3)
                .startDate(now.plusWeeks(2))
                .endDate(now.plusMonths(12))
                .note("Dang ky thue phong 302 - Binh Thanh")
                .status(RentalRequestStatus.PENDING)
                .build());

        meterReadingRepo.save(MeterReading.builder()
                .room(r101).period(currentPeriod).utilityType(UtilityType.ELECTRICITY)
                .previousReading(100.0).currentReading(250.0)
                .unitPrice(new BigDecimal("3500"))
                .recordedBy(manager1)
                .build());

        meterReadingRepo.save(MeterReading.builder()
                .room(r101).period(currentPeriod).utilityType(UtilityType.WATER)
                .previousReading(10.0).currentReading(18.0)
                .unitPrice(new BigDecimal("15000"))
                .recordedBy(manager1)
                .build());

        maintenanceRepo.save(MaintenanceRequest.builder()
                .room(r101).tenant(tenant1)
                .title("Dieu hoa bi hong")
                .description("Dieu hoa phong 101 khong lan, can kiem tra gas va block.")
                .priority("HIGH")
                .status(MaintenanceStatus.IN_PROGRESS)
                .build());

        maintenanceRepo.save(MaintenanceRequest.builder()
                .room(r201).tenant(tenant2)
                .title("Voi nuoc chay yeu")
                .description("Voi lavabo phong 201 chay rat yeu.")
                .priority("MEDIUM")
                .status(MaintenanceStatus.NEW)
                .build());

        notificationRepo.save(Notification.builder()
                .recipient(tenant1)
                .type(NotificationType.BILL_ISSUED)
                .title("Hoa don thang " + currentPeriod + " da duoc tao")
                .message("Hoa don tien thue va dich vu thang " + currentPeriod + " da san sang. Vui long kiem tra muc thanh toan.")
                .isRead(false)
                .relatedEntityType("Bill")
                .relatedEntityId(billT1Current.getId())
                .build());

        notificationRepo.save(Notification.builder()
                .recipient(tenant1)
                .type(NotificationType.MAINTENANCE_STATUS_UPDATED)
                .title("Yeu cau bao tri da duoc tiep nhan")
                .message("Yeu cau sua dieu hoa phong 101 dang duoc xu ly boi quan ly.")
                .isRead(true)
                .relatedEntityType("Maintenance")
                .build());

        log.info("=== Seed hoan tat! ===");
        log.info("Tai khoan demo:");
        log.info("  Admin    : admin@rentalms.com / admin123");
        log.info("  Owner    : owner@rentalms.com / owner123");
        log.info("  Manager1 : manager1@rentalms.com / manager123");
        log.info("  Manager2 : manager2@rentalms.com / manager123");
        log.info("  Tenant1  : tenant1@rentalms.com / tenant123");
        log.info("  Tenant2  : tenant2@rentalms.com / tenant123");
        log.info("  Tenant3  : tenant3@rentalms.com / tenant123");
    }

    private static Room room(Building b, String no, BigDecimal price, Double area, RoomStatus status, int beds) {
        return Room.builder()
                .building(b)
                .roomNo(no)
                .price(price)
                .area(area)
                .beds(beds)
                .amenities("Wifi, Dieu hoa, Nha ve sinh rieng")
                .description("Phong " + no)
                .status(status)
                .build();
    }
}
