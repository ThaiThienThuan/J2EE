package com.rentalms.repository;

import com.rentalms.entity.TenantCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface TenantCreditRepository extends JpaRepository<TenantCredit, Long> {
    List<TenantCredit> findByTenantIdAndRemainingAmountGreaterThanOrderByCreatedAtAsc(Long tenantId, BigDecimal amount);

    @Query("select coalesce(sum(c.remainingAmount), 0) from TenantCredit c where c.tenant.id = :tenantId")
    BigDecimal getAvailableCredit(Long tenantId);
}
