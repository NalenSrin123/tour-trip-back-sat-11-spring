package com.etec.tourtripapi.dashboard.service;

import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.common.enums.RefundStatus;
import com.etec.tourtripapi.dashboard.dto.response.DashboardStatsResponse;
import com.etec.tourtripapi.payment.repository.PaymentRepository;
import com.etec.tourtripapi.refund.repository.RefundRepository;
import com.etec.tourtripapi.tour.repository.TourRepository;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;

    @Override
    public DashboardStatsResponse getAdminDashboardStats() {
        long userCount = userRepository.count();
        long tourCount = tourRepository.count();
        long bookingCount = bookingRepository.count();

        // SUM/COUNT computed in SQL — never loads full tables into memory
        BigDecimal revenueSum = paymentRepository.sumAllAmounts();
        double revenue = revenueSum != null ? revenueSum.doubleValue() : 0.0;

        long pendingRefundsCount = refundRepository.countByStatus(RefundStatus.PENDING);

        return new DashboardStatsResponse(userCount, tourCount, bookingCount, revenue, pendingRefundsCount);
    }
}