package com.etec.tourtripapi.payment.dto.response;

import com.etec.tourtripapi.common.enums.PaymentStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String method;
    private PaymentStatus status; // Changed from String to PaymentStatus enum
    private String transactionId;
    private LocalDateTime paidAt;
}