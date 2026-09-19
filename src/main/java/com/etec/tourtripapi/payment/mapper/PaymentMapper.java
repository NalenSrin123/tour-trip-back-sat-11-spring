package com.etec.tourtripapi.payment.mapper;

import com.etec.tourtripapi.payment.dto.response.PaymentResponse;
import com.etec.tourtripapi.payment.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        if (payment == null) return null;

        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setBookingId(payment.getBooking() != null ? payment.getBooking().getId() : null);
        response.setAmount(payment.getAmount());
        response.setMethod(payment.getMethod());
        response.setStatus(payment.getStatus()); // Directly assigns PaymentStatus enum
        response.setTransactionId(payment.getTransactionId());
        response.setPaidAt(payment.getPaidAt());

        return response;
    }
}