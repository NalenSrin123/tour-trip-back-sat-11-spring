package com.etec.tourtripapi.refund.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RefundRequest {
    private Long bookingId;
    private BigDecimal amount;
    private String reason;
}