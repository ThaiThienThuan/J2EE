package com.rentalms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false)
    private BigDecimal amount;

    // CASH, BANK_TRANSFER, ONLINE
    private String method;

    // PENDING, SUCCESS, FAILED
    private String status = "PENDING";

    private String orderId;

    private String requestId;

    private String transId;

    private String payerName;

    private String payerPhone;

    private String payerEmail;

    private String referenceCode;

    private String proofImageUrl;

    private String note;

    @Column(columnDefinition = "TEXT")
    private String callbackPayload;

    private LocalDateTime paidAt;

    private LocalDateTime confirmedAt;

    private Long confirmedByUserId;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<PaymentAllocation> allocations;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
