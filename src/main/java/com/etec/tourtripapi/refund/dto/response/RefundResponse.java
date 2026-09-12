package com.etec.tourtripapi.refund.dto.response;

import com.etec.tourtripapi.common.enums.RefundStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RefundResponse {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String reason;
    private RefundStatus status; // Changed from String to RefundStatus enum
    private LocalDateTime refundedAt;
}