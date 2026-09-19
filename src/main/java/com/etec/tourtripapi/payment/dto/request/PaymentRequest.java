package com.etec.tourtripapi.payment.dto.request;

import com.etec.tourtripapi.common.enums.PaymentMethod;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long bookingId;
    private BigDecimal amount;
    private PaymentMethod method; // Type-safe enum instead of String
}