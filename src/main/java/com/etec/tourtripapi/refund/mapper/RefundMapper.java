package com.etec.tourtripapi.refund.mapper;

import com.etec.tourtripapi.refund.dto.response.RefundResponse;
import com.etec.tourtripapi.refund.entity.Refund;
import org.springframework.stereotype.Component;

@Component
public class RefundMapper {

    public RefundResponse toResponse(Refund refund) {
        if (refund == null) return null;

        RefundResponse response = new RefundResponse();
        response.setId(refund.getId());
        response.setBookingId(refund.getBooking() != null ? refund.getBooking().getId() : null);
        response.setAmount(refund.getAmount());
        response.setReason(refund.getReason());
        response.setStatus(refund.getStatus()); // Directly assigns RefundStatus enum
        response.setRefundedAt(refund.getRefundedAt());

        return response;
    }
}