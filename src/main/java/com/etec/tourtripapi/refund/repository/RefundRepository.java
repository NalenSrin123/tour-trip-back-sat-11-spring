package com.etec.tourtripapi.refund.repository;

import com.etec.tourtripapi.common.enums.RefundStatus;
import com.etec.tourtripapi.refund.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    Optional<Refund> findByBookingId(Long bookingId);
    List<Refund> findByBookingIdIn(Collection<Long> bookingIds);

    // COUNT in SQL instead of loading every refund row
    long countByStatus(RefundStatus status);
}