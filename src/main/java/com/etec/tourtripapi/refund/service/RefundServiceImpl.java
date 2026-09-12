package com.etec.tourtripapi.refund.service;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.common.enums.RefundStatus;
import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.refund.dto.request.RefundRequest;
import com.etec.tourtripapi.refund.dto.response.RefundResponse;
import com.etec.tourtripapi.refund.entity.Refund;
import com.etec.tourtripapi.refund.mapper.RefundMapper;
import com.etec.tourtripapi.refund.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final BookingRepository bookingRepository;
    private final RefundMapper refundMapper;

    @Override
    @Transactional
    public RefundResponse requestRefund(RefundRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        if (refundRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new ConflictException("A refund request already exists for this booking!");
        }

        Refund refund = new Refund();
        refund.setBooking(booking);
        refund.setAmount(request.getAmount());
        refund.setReason(request.getReason());
        refund.setStatus(RefundStatus.PENDING);

        return refundMapper.toResponse(refundRepository.save(refund));
    }

    @Override
    public List<RefundResponse> getAllRefunds() {
        return refundRepository.findAll().stream()
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
        if (status == RefundStatus.COMPLETED || status == RefundStatus.APPROVED) {
            refund.setRefundedAt(LocalDateTime.now());
        }

        return refundMapper.toResponse(refundRepository.save(refund));
    }
}