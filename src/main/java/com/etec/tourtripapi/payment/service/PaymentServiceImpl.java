package com.etec.tourtripapi.payment.service;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.common.enums.BookingStatus;
import com.etec.tourtripapi.common.enums.PaymentMethod;
import com.etec.tourtripapi.common.enums.PaymentStatus;
import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.notification.service.NotificationService;
import com.etec.tourtripapi.payment.dto.request.PaymentRequest;
import com.etec.tourtripapi.payment.dto.response.PaymentResponse;
import com.etec.tourtripapi.payment.entity.Payment;
import com.etec.tourtripapi.payment.gateway.PaymentGateway;
import com.etec.tourtripapi.payment.mapper.PaymentMapper;
import com.etec.tourtripapi.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentGateway paymentGateway;
    private final PaymentMapper paymentMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PaymentResponse makePayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new ConflictException("Payment already exists for this booking!");
        }

        // A payment may only succeed for a booking that is still payable.
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new ConflictException("Payment cannot be processed: booking #" + booking.getId()
                    + " is " + booking.getStatus() + ".");
        }

        PaymentMethod method = request.getMethod();

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setMethod(method.name());

        if (method == PaymentMethod.CASH) {
            // Cash is collected on arrival: no gateway call, nothing marked paid.
            // The booking stays PENDING until an admin marks the cash as received.
            payment.setStatus(PaymentStatus.PENDING);
            if (booking.getStatus() != BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.PENDING);
                bookingRepository.save(booking);
            }
        } else {
            // Process through simulated payment gateway using .name() to pass the method as a String
            boolean isSuccess = paymentGateway.processPayment(method.name(), request.getAmount());

            if (isSuccess) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setTransactionId(paymentGateway.generateTransactionId());
                payment.setPaidAt(LocalDateTime.now());
                // A successful payment is what confirms the booking.
                if (booking.getStatus() != BookingStatus.CONFIRMED) {
                    booking.setStatus(BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);
                }
            } else {
                // No successful payment means no confirmation: the booking stays PENDING.
                payment.setStatus(PaymentStatus.FAILED);
            }
        }

        PaymentResponse response = paymentMapper.toResponse(paymentRepository.save(payment));

        if (payment.getStatus() == PaymentStatus.PAID) {
            notificationService.createForAdmins("PAYMENT_RECEIVED",
                    "Payment received for booking #" + booking.getId() + " via " + method.name() + ".");
            if (booking.getUser() != null) {
                notificationService.createNotification(booking.getUser(), "PAYMENT_RECEIVED",
                        "Payment received — booking #" + booking.getId() + " is confirmed.");
            }
        } else if (payment.getStatus() == PaymentStatus.PENDING) {
            notificationService.createForAdmins("PAYMENT_PENDING",
                    "Cash payment pending for booking #" + booking.getId() + ".");
        }

        return response;
    }

    @Override
    @Transactional
    public PaymentResponse updatePaymentStatus(Long id, String statusStr) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ConflictException("Invalid payment status: " + statusStr);
        }

        payment.setStatus(status);

        if (status == PaymentStatus.PAID) {
            if (payment.getPaidAt() == null) {
                payment.setPaidAt(LocalDateTime.now());
            }
            if (payment.getTransactionId() == null) {
                payment.setTransactionId(paymentGateway.generateTransactionId());
            }
            // Collecting cash (or back-filling a payment) confirms the booking.
            Booking booking = payment.getBooking();
            if (booking != null && booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
            }
        }

        PaymentResponse response = paymentMapper.toResponse(paymentRepository.save(payment));

        Booking savedBooking = payment.getBooking();
        if (status == PaymentStatus.PAID && savedBooking != null && savedBooking.getUser() != null) {
            notificationService.createForAdmins("PAYMENT_RECEIVED",
                    "Payment received for booking #" + savedBooking.getId() + ".");
            notificationService.createNotification(savedBooking.getUser(), "PAYMENT_RECEIVED",
                    "Payment confirmed — booking #" + savedBooking.getId() + " is confirmed.");
        }

        return response;
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return paymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking id: " + bookingId));
        return paymentMapper.toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        // Newest payments first, so freshly created transactions appear at the top
        return paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }
}