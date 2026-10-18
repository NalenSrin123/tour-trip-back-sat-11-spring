package com.etec.tourtripapi.refund.service;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.common.enums.BookingStatus;
import com.etec.tourtripapi.common.enums.PaymentStatus;
import com.etec.tourtripapi.common.enums.RefundStatus;
import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.notification.service.NotificationService;
import com.etec.tourtripapi.payment.entity.Payment;
import com.etec.tourtripapi.payment.repository.PaymentRepository;
import com.etec.tourtripapi.refund.dto.request.RefundRequest;
import com.etec.tourtripapi.refund.dto.response.RefundResponse;
import com.etec.tourtripapi.refund.entity.Refund;
import com.etec.tourtripapi.refund.mapper.RefundMapper;
import com.etec.tourtripapi.refund.repository.RefundRepository;
import com.etec.tourtripapi.schedule.entity.TourSchedule;
import com.etec.tourtripapi.schedule.repository.TourScheduleRepository;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TourScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final RefundMapper refundMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public RefundResponse requestRefund(RefundRequest request, String userEmail) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        boolean isOwner = booking.getUser() != null && booking.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equalsIgnoreCase(role.getName()));

        if (!isOwner && !isAdmin) {
            throw new ConflictException("You can only request a refund for your own booking!");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ConflictException("This booking is already cancelled and cannot be refunded.");
        }

        if (refundRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new ConflictException("A refund request already exists for this booking!");
        }

        Refund refund = new Refund();
        refund.setBooking(booking);
        refund.setAmount(request.getAmount());
        refund.setReason(request.getReason());
        refund.setStatus(RefundStatus.PENDING);

        Refund saved = refundRepository.save(refund);

        String requestedBy = booking.getUser() != null ? booking.getUser().getEmail() : userEmail;
        notificationService.createForAdmins("REFUND_REQUESTED",
                "New refund request for booking #" + booking.getId() + " by " + requestedBy
                        + " — " + saved.getReason());
        notificationService.createNotification(user, "REFUND_REQUESTED",
                "Your refund request for booking #" + booking.getId() + " is pending review.");

        return refundMapper.toResponse(saved);
    }

    @Override
    public List<RefundResponse> getAllRefunds() {
        // Newest refund requests first
        return refundRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(refundMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RefundResponse> getMyRefunds(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        List<Long> bookingIds = bookingRepository.findByUserId(user.getId()).stream()
                .map(Booking::getId)
                .collect(Collectors.toList());

        if (bookingIds.isEmpty()) {
            return Collections.emptyList();
        }

        return refundRepository.findByBookingIdIn(bookingIds).stream()
                .map(refundMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RefundResponse getRefundById(Long id) {
        Refund refund = refundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found with id: " + id));
        return refundMapper.toResponse(refund);
    }

    @Override
    @Transactional
    public RefundResponse updateRefundStatus(Long id, String statusStr) {
        Refund refund = refundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found with id: " + id));

        RefundStatus status;
        try {
            status = RefundStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ConflictException("Invalid refund status: " + statusStr);
        }

        refund.setStatus(status);

        if (status == RefundStatus.APPROVED || status == RefundStatus.COMPLETED) {
            if (refund.getRefundedAt() == null) {
                refund.setRefundedAt(LocalDateTime.now());
            }
            applyRefundEffect(refund.getBooking());
        }

        Refund saved = refundRepository.save(refund);

        Booking savedBooking = saved.getBooking();
        if (savedBooking != null && savedBooking.getUser() != null) {
            notificationService.createNotification(savedBooking.getUser(), "REFUND_" + status,
                    "Your refund request for booking #" + savedBooking.getId() + " was "
                            + status.name().toLowerCase() + ".");
        }

        return refundMapper.toResponse(saved);
    }

    /**
     * Once a refund is approved/paid out, the money is returned to the customer:
     * mark the booking's payment as REFUNDED, cancel the booking and release the
     * reserved slots back to the schedule. Idempotent so APPROVED -> COMPLETED
     * does not release the same slots twice.
     */
    private void applyRefundEffect(Booking booking) {
        if (booking == null) {
            return;
        }

        paymentRepository.findByBookingId(booking.getId()).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        });

        if (booking.getStatus() != BookingStatus.CANCELLED) {
            TourSchedule schedule = booking.getSchedule();
            if (schedule != null && booking.getNumberOfParticipants() != null) {
                schedule.setAvailableSlots(schedule.getAvailableSlots() + booking.getNumberOfParticipants());
                scheduleRepository.save(schedule);
            }
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }
    }
}
