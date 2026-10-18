package com.etec.tourtripapi.refund.mapper;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.payment.entity.Payment;
import com.etec.tourtripapi.payment.repository.PaymentRepository;
import com.etec.tourtripapi.refund.dto.response.RefundResponse;
import com.etec.tourtripapi.refund.entity.Refund;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RefundMapper {

    private final PaymentRepository paymentRepository;

    public RefundResponse toResponse(Refund refund) {
        if (refund == null) return null;

        RefundResponse response = new RefundResponse();
        response.setId(refund.getId());
        response.setAmount(refund.getAmount());
        response.setReason(refund.getReason());
        response.setStatus(refund.getStatus());
        response.setRefundedAt(refund.getRefundedAt());

        Booking booking = refund.getBooking();
        if (booking == null) {
            return response;
        }

        response.setBookingId(booking.getId());
        response.setBookingStatus(booking.getStatus());
        response.setNumberOfParticipants(booking.getNumberOfParticipants());
        response.setBookingTotal(booking.getTotalPrice());
        response.setBookingDate(booking.getBookingDate());

        if (booking.getUser() != null) {
            response.setUserEmail(booking.getUser().getEmail());
            response.setUserFullName(booking.getUser().getFullName());
        }

        if (booking.getSchedule() != null) {
            response.setStartDate(booking.getSchedule().getStartDate());
            response.setEndDate(booking.getSchedule().getEndDate());
            if (booking.getSchedule().getTour() != null) {
                response.setTourTitle(booking.getSchedule().getTour().getTitle());
            }
        }

        Optional<Payment> payment = paymentRepository.findByBookingId(booking.getId());
        payment.ifPresent(p -> {
            response.setPaymentMethod(p.getMethod());
            response.setPaymentStatus(p.getStatus());
        });

        return response;
    }
}
