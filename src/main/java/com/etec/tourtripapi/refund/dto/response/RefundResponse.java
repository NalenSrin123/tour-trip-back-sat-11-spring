package com.etec.tourtripapi.refund.dto.response;

import com.etec.tourtripapi.common.enums.BookingStatus;
import com.etec.tourtripapi.common.enums.PaymentStatus;
import com.etec.tourtripapi.common.enums.RefundStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RefundResponse {
    private Long id;
    private Long bookingId;

    // Customer
    private String userEmail;
    private String userFullName;

    // Tour & schedule
    private String tourTitle;
    private LocalDate startDate;
    private LocalDate endDate;

    // Booking context, so the admin can judge the request without opening another page
    private BookingStatus bookingStatus;
    private Integer numberOfParticipants;
    private BigDecimal bookingTotal;
    private LocalDateTime bookingDate;

    // Payment context
    private String paymentMethod;
    private PaymentStatus paymentStatus;

    // Refund itself
    private BigDecimal amount;
    private String reason;
    private RefundStatus status;
    private LocalDateTime refundedAt;
}
