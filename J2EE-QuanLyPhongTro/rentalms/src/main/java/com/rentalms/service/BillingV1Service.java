package com.rentalms.service;

import com.rentalms.entity.*;
import com.rentalms.enums.BillStatus;
import com.rentalms.enums.ContractStatus;
import com.rentalms.enums.NotificationType;
import com.rentalms.exception.BusinessException;
import com.rentalms.exception.MomoIpnSignatureException;
import com.rentalms.exception.NotFoundException;
import com.rentalms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingV1Service {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final TenantCreditRepository tenantCreditRepository;
    private final ContractRepository contractRepository;
    private final AccessControlService accessControlService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Value("${app.momo.partner-code:}")
    private String partnerCode;
    @Value("${app.momo.access-key:}")
    private String accessKey;
    @Value("${app.momo.secret-key:}")
    private String secretKey;
    @Value("${app.momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String momoEndpoint;
    @Value("${app.momo.redirect-url:http://localhost:3000/payment/momo/callback}")
    private String redirectUrl;
    @Value("${app.momo.ipn-url:http://localhost:8080/api/v1/payments/momo/ipn}")
    private String ipnUrl;

    public List<Bill> getBillsForTenant(Long tenantId) {
        return billRepository.findByTenantId(tenantId);
    }

    public List<Bill> getBillsForOwner(Long ownerId, BillStatus status) {
        return billRepository.findOwnerBills(ownerId, status);
    }

    public List<Bill> getBillsForManager(User actor) {
        return billRepository.findAll().stream()
                .filter(bill -> accessControlService.canViewBill(actor, bill))
                .toList();
    }

    public List<Bill> getBillsForManagedBuilding(Long buildingId, BillStatus status, User actor) {
        List<Bill> bills = billRepository.findByBuildingIdAndOptionalStatus(buildingId, status);
        if (bills.isEmpty()) {
            Contract anyContract = contractRepository.findAll().stream()
                    .filter(contract -> contract.getRoom().getBuilding().getId().equals(buildingId))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Khong tim thay building"));
            accessControlService.assertCanManageBuilding(actor, anyContract.getRoom().getBuilding());
            return bills;
        }
        accessControlService.assertCanManageBuilding(actor, bills.get(0).getContract().getRoom().getBuilding());
        return bills;
    }

    @Transactional
    public Bill generateBill(Long contractId, String period, User actor) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hop dong"));
        if (!contract.isActivationConfirmed() || contract.getStatus() != ContractStatus.ACTIVE) {
            throw new BusinessException("Chi tao hoa don cho hop dong da active");
        }
        if (!accessControlService.canViewContract(actor, contract) || actor.getRole().name().equals("ADMIN")) {
            throw new BusinessException("Khong co quyen tao hoa don cho hop dong nay");
        }
        if (billRepository.findByContractIdAndPeriod(contractId, period).isPresent()) {
            throw new BusinessException("Hoa don ky nay da ton tai");
        }

        Bill bill = Bill.builder()
                .contract(contract)
                .period(period)
                .dueDate(LocalDate.now().plusDays(10))
                .status(BillStatus.UNPAID)
                .totalAmount(contract.getMonthlyRent())
                .paidAmount(BigDecimal.ZERO)
                .lateFee(BigDecimal.ZERO)
                .outstandingAmount(contract.getMonthlyRent())
                .build();
        Bill saved = billRepository.save(bill);

        billItemRepository.save(BillItem.builder()
                .bill(saved)
                .itemType("RENT")
                .description("Tien thue thang " + period)
                .amount(contract.getMonthlyRent())
                .build());

        applyAvailableCredit(saved);
        notificationService.notify(contract.getTenant(), NotificationType.BILL_ISSUED,
                "Hoa don moi", "Hoa don " + period + " da duoc tao", "Bill", saved.getId());
        auditService.log(actor.getId(), actor.getEmail(), "GENERATE_BILL", "Bill", saved.getId(),
                "Tao hoa don ky " + period);
        return billRepository.save(saved);
    }

    @Transactional
    public Bill addManualItem(Long billId, String itemType, String description, BigDecimal amount, User actor) {
        Bill bill = findManagedBill(billId, actor);
        BillItem item = BillItem.builder()
                .bill(bill)
                .itemType(itemType)
                .description(description)
                .amount(amount)
                .build();
        billItemRepository.save(item);
        recalculateBill(bill);
        auditService.log(actor.getId(), actor.getEmail(), "ADD_BILL_ITEM", "Bill", billId,
                "Them khoan phi " + itemType);
        return billRepository.save(bill);
    }

    @Transactional
    public Payment createCashPending(Long billId, BigDecimal amount, User actor,
            String payerName, String payerPhone, String note) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hoa don"));
        Payment payment = Payment.builder()
                .bill(bill)
                .amount(amount)
                .method("CASH")
                .status("PENDING_CONFIRMATION")
                .payerName(payerName)
                .payerPhone(payerPhone)
                .note(note)
                .paidAt(LocalDateTime.now())
                .build();
        Payment saved = paymentRepository.save(payment);
        auditService.log(actor.getId(), actor.getEmail(), "PAYMENT_PENDING_CASH", "Payment", saved.getId(),
                "Tao phieu thanh toan tien mat cho bill " + billId);
        return saved;
    }

    @Transactional
    public Payment confirmCash(Long paymentId, User actor) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay payment"));
        Bill bill = findManagedBill(payment.getBill().getId(), actor);
        if (!"PENDING_CONFIRMATION".equals(payment.getStatus())) {
            throw new BusinessException("Payment nay khong o trang thai cho xac nhan");
        }
        if (bill.getStatus() == BillStatus.PAID) {
            throw new BusinessException("Hoa don da o trang thai PAID");
        }
        payment.setStatus("SUCCESS");
        payment.setConfirmedAt(LocalDateTime.now());
        payment.setConfirmedByUserId(actor.getId());
        applySuccessfulPayment(payment);
        auditService.log(actor.getId(), actor.getEmail(), "CONFIRM_CASH_PAYMENT", "Payment", paymentId,
                "Xac nhan thanh toan tien mat cho bill " + bill.getId());
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment confirmCashByBill(Long billId, User actor) {
        Bill bill = findManagedBill(billId, actor);
        if (bill.getStatus() == BillStatus.PAID) {
            throw new BusinessException("Hoa don da o trang thai PAID");
        }
        Payment payment = paymentRepository.findPendingCashPayment(billId)
                .orElseThrow(() -> new NotFoundException("Khong co pending cash payment cho hoa don nay"));
        return confirmCash(payment.getId(), actor);
    }

    @Transactional
    public Payment handleMomoIpn(Map<String, String> callback) {
        assertMomoIpnSignatureValid(callback);

        String orderId = ipnField(callback, "orderId");
        if (orderId.isEmpty()) {
            throw new NotFoundException("Thieu orderId trong MoMo IPN");
        }

        Payment payment = paymentRepository.findByOrderIdForUpdate(orderId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay payment order"));

        if ("SUCCESS".equals(payment.getStatus())) {
            return payment;
        }

        String transId = ipnField(callback, "transId");
        if (!transId.isEmpty()) {
            Optional<Payment> byTrans = paymentRepository.findByTransId(transId);
            if (byTrans.isPresent()) {
                Payment other = byTrans.get();
                if (!other.getId().equals(payment.getId())) {
                    return other;
                }
                if ("SUCCESS".equals(other.getStatus())) {
                    return other;
                }
            }
        }

        payment.setTransId(transId.isEmpty() ? null : transId);
        payment.setCallbackPayload(callback.toString());
        payment.setPaidAt(LocalDateTime.now());

        String resultCode = ipnField(callback, "resultCode");
        if (resultCode.isEmpty()) {
            resultCode = "-1";
        }
        if (!"0".equals(resultCode)) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            auditService.log(null, null, "MOMO_IPN_FAILED", "Payment", payment.getId(),
                    "MoMo callback failed: " + callback);
            return payment;
        }

        payment.setStatus("SUCCESS");
        applySuccessfulPayment(payment);
        auditService.log(null, null, "MOMO_IPN_SUCCESS", "Payment", payment.getId(),
                "MoMo callback success");
        return paymentRepository.save(payment);
    }

    /**
     * MoMo IPN: HMAC-SHA256, fields accessKey..transId alphabetically (MoMo wallet
     * / sandbox).
     */
    private void assertMomoIpnSignatureValid(Map<String, String> callback) {
        String received = ipnField(callback, "signature");
        if (received.isEmpty()) {
            auditService.log(null, null, "MOMO_IPN_INVALID_SIGNATURE", "Payment", null,
                    "Thieu signature trong IPN, orderId=" + ipnField(callback, "orderId"));
            throw new MomoIpnSignatureException("Thieu chu ky MoMo IPN");
        }

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + ipnField(callback, "amount")
                + "&extraData=" + ipnField(callback, "extraData")
                + "&message=" + ipnField(callback, "message")
                + "&orderId=" + ipnField(callback, "orderId")
                + "&orderInfo=" + ipnField(callback, "orderInfo")
                + "&orderType=" + ipnField(callback, "orderType")
                + "&partnerCode=" + ipnField(callback, "partnerCode")
                + "&payType=" + ipnField(callback, "payType")
                + "&requestId=" + ipnField(callback, "requestId")
                + "&responseTime=" + ipnField(callback, "responseTime")
                + "&resultCode=" + ipnField(callback, "resultCode")
                + "&transId=" + ipnField(callback, "transId");

        String expectedHex = hmacSha256(rawSignature, secretKey).toLowerCase();
        String receivedNorm = received.trim().toLowerCase();
        if (!MessageDigest.isEqual(
                expectedHex.getBytes(StandardCharsets.UTF_8),
                receivedNorm.getBytes(StandardCharsets.UTF_8))) {
            auditService.log(null, null, "MOMO_IPN_INVALID_SIGNATURE", "Payment", null,
                    "Chu ky khong khop, orderId=" + ipnField(callback, "orderId"));
            throw new MomoIpnSignatureException("Chu ky MoMo IPN khong hop le");
        }
    }

    private static String ipnField(Map<String, String> callback, String key) {
        String v = callback.get(key);
        return v != null ? v : "";
    }

    @Transactional
    public void applySuccessfulPayment(Payment payment) {
        Bill bill = payment.getBill();
        BigDecimal amount = payment.getAmount();
        BigDecimal currentOutstanding = bill.getOutstandingAmount() != null
                ? bill.getOutstandingAmount()
                : bill.getTotalAmount().add(bill.getLateFee()).subtract(bill.getPaidAmount());

        BigDecimal appliedToBill = amount.min(currentOutstanding.max(BigDecimal.ZERO));
        if (appliedToBill.compareTo(BigDecimal.ZERO) > 0) {
            paymentAllocationRepository.save(PaymentAllocation.builder()
                    .payment(payment)
                    .bill(bill)
                    .amount(appliedToBill)
                    .allocationType("BILL_PAYMENT")
                    .build());
        }

        bill.setPaidAmount(bill.getPaidAmount().add(appliedToBill));
        BigDecimal overpay = amount.subtract(appliedToBill);
        if (overpay.compareTo(BigDecimal.ZERO) > 0) {
            TenantCredit credit = tenantCreditRepository.save(TenantCredit.builder()
                    .tenant(bill.getContract().getTenant())
                    .amount(overpay)
                    .remainingAmount(overpay)
                    .sourceType("OVERPAYMENT")
                    .sourceId(payment.getId())
                    .note("Du tien tu payment " + payment.getId())
                    .build());
            paymentAllocationRepository.save(PaymentAllocation.builder()
                    .payment(payment)
                    .tenantCredit(credit)
                    .amount(overpay)
                    .allocationType("CREDIT_GENERATED")
                    .build());
            bill.setCreditGenerated(bill.getCreditGenerated().add(overpay));
            auditService.log(bill.getContract().getTenant().getId(), bill.getContract().getTenant().getEmail(),
                    "GENERATE_CREDIT", "TenantCredit", credit.getId(), "Tao credit tu overpay");
        }

        recalculateBill(bill);
        billRepository.save(bill);
        notificationService.notify(bill.getContract().getTenant(), NotificationType.BILL_PAID,
                "Thanh toan da ghi nhan", "Thanh toan cho hoa don " + bill.getPeriod() + " da duoc ghi nhan",
                "Bill", bill.getId());
    }

    @Transactional
    public void applyAvailableCredit(Bill bill) {
        List<TenantCredit> credits = tenantCreditRepository
                .findByTenantIdAndRemainingAmountGreaterThanOrderByCreatedAtAsc(
                        bill.getContract().getTenant().getId(), BigDecimal.ZERO);
        BigDecimal remaining = bill.getOutstandingAmount() != null ? bill.getOutstandingAmount()
                : bill.getTotalAmount();
        for (TenantCredit credit : credits) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            BigDecimal used = credit.getRemainingAmount().min(remaining);
            if (used.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            credit.setRemainingAmount(credit.getRemainingAmount().subtract(used));
            tenantCreditRepository.save(credit);
            bill.setCreditApplied(bill.getCreditApplied().add(used));
            bill.setPaidAmount(bill.getPaidAmount().add(used));
            paymentAllocationRepository.save(PaymentAllocation.builder()
                    .bill(bill)
                    .tenantCredit(credit)
                    .amount(used)
                    .allocationType("CREDIT_APPLIED")
                    .build());
            remaining = remaining.subtract(used);
        }
        recalculateBill(bill);
    }

    @Transactional
    public void markOverdue() {
        for (Bill bill : billRepository.findOverdue(LocalDate.now())) {
            applyAvailableCredit(bill);
            recalculateBill(bill);
            billRepository.save(bill);
            if (bill.getOutstandingAmount().compareTo(BigDecimal.ZERO) > 0) {
                bill.setStatus(BillStatus.OVERDUE);
                billRepository.save(bill);
            }
        }
    }

    public BigDecimal getAvailableCredit(Long tenantId) {
        return tenantCreditRepository.getAvailableCredit(tenantId);
    }

    public Bill findManagedBill(Long billId, User actor) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hoa don"));
        if (!accessControlService.canViewBill(actor, bill) || actor.getRole().name().equals("ADMIN")) {
            throw new BusinessException("Khong co quyen thao tac hoa don nay");
        }
        return bill;
    }

    public void recalculateBill(Bill bill) {
        BigDecimal totalItems = billItemRepository.findByBillId(bill.getId()).stream()
                .map(BillItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        bill.setTotalAmount(totalItems);
        BigDecimal outstanding = totalItems.add(bill.getLateFee()).subtract(bill.getPaidAmount());
        bill.setOutstandingAmount(outstanding.max(BigDecimal.ZERO));
        if (bill.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            bill.setStatus(BillStatus.PAID);
        } else if (bill.getDueDate() != null && bill.getDueDate().isBefore(LocalDate.now())) {
            bill.setStatus(BillStatus.OVERDUE);
        } else {
            bill.setStatus(BillStatus.UNPAID);
        }
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSha256.init(secretKeySpec);
            byte[] bytes = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte aByte : bytes) {
                hash.append(String.format("%02x", aByte));
            }
            return hash.toString();
        } catch (Exception e) {
            throw new BusinessException("Khong the ky request MoMo");
        }
    }

    @Transactional
    public Map<String, Object> createMomoPayment(Long billId, BigDecimal amount,
            String payerName, String note) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hoa don"));

        String orderId = "MOMO-" + billId + "-" + UUID.randomUUID();
        String requestId = UUID.randomUUID().toString();
        long amountLong = amount.longValue();
        String orderInfo = "Thanh toan hoa don " + bill.getId();

        Payment payment = paymentRepository.save(Payment.builder()
                .bill(bill)
                .amount(amount)
                .method("MOMO")
                .status("PENDING")
                .orderId(orderId)
                .requestId(requestId)
                .payerName(payerName)
                .note(note)
                .build());

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amountLong
                + "&extraData="
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=captureWallet";
        String signature = hmacSha256(rawSignature, secretKey);

        Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("partnerCode", partnerCode);
            payload.put("accessKey", accessKey);       
            payload.put("requestId", requestId);
            payload.put("amount", amountLong);        
            payload.put("orderId", orderId);
            payload.put("orderInfo", orderInfo);
            payload.put("redirectUrl", redirectUrl);
            payload.put("ipnUrl", ipnUrl);
            payload.put("extraData", "");
            payload.put("requestType", "captureWallet");
            payload.put("lang", "vi");
            payload.put("signature", signature);


        // === GỌI MOMO API THẬT ===
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String requestBody = mapper.writeValueAsString(payload);

            java.net.URL url = new java.net.URL(momoEndpoint);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            try (java.io.OutputStream os = conn.getOutputStream()) {
                os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            }

            String response;
            try (java.io.BufferedReader br = new java.io.BufferedReader(
                    new java.io.InputStreamReader(conn.getInputStream(),
                            StandardCharsets.UTF_8))) {
                response = br.lines().collect(
                        java.util.stream.Collectors.joining());
            }

            Map<String, Object> momoResponse = mapper.readValue(response,
                    new com.fasterxml.jackson.core.type.TypeReference<>() {
                    });

            auditService.log(
                    bill.getContract().getTenant().getId(),
                    bill.getContract().getTenant().getEmail(),
                    "CREATE_MOMO_ORDER", "Payment", payment.getId(),
                    "Tao lenh MoMo: resultCode=" + momoResponse.get("resultCode"));

            // Trả payUrl về frontend để redirect
            return Map.of(
                    "paymentId", payment.getId(),
                    "orderId", orderId,
                    "payUrl", momoResponse.getOrDefault("payUrl", ""),
                    "resultCode", momoResponse.getOrDefault("resultCode", -1),
                    "message", momoResponse.getOrDefault("message", ""));

        } catch (Exception e) {
            throw new BusinessException("Khong the ket noi MoMo: " + e.getMessage());
        }
    }
    
}
