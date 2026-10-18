package com.etec.tourtripapi.report.service;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.payment.entity.Payment;
import com.etec.tourtripapi.payment.repository.PaymentRepository;
import com.etec.tourtripapi.report.excel.BookingExcelExporter;
import com.etec.tourtripapi.report.excel.PaymentExcelExporter;
import com.etec.tourtripapi.report.pdf.BookingPdfExporter;
import com.etec.tourtripapi.report.pdf.PaymentPdfExporter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingExcelExporter excelExporter;
    private final BookingPdfExporter pdfExporter;
    private final PaymentExcelExporter paymentExcelExporter;
    private final PaymentPdfExporter paymentPdfExporter;

    @Override
    public ByteArrayInputStream exportBookingsExcel(String status, String from, String to) {
        return excelExporter.export(filteredBookings(status, from, to));
    }

    @Override
    public ByteArrayInputStream exportBookingsPdf(String status, String from, String to) {
        return pdfExporter.export(filteredBookings(status, from, to));
    }

    @Override
    public ByteArrayInputStream exportPaymentsExcel(String status, String from, String to) {
        return paymentExcelExporter.export(filteredPayments(status, from, to));
    }

    @Override
    public ByteArrayInputStream exportPaymentsPdf(String status, String from, String to) {
        return paymentPdfExporter.export(filteredPayments(status, from, to));
    }

    private List<Booking> filteredBookings(String status, String from, String to) {
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> matchesStatus(status, b.getStatus() != null ? b.getStatus().name() : null))
                .filter(b -> matchesRange(from, to, b.getBookingDate()))
                .sorted(Comparator.comparing(Booking::getBookingDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Booking::getId, Comparator.reverseOrder()))
                .collect(Collectors.toList());
        return bookings;
    }

    private List<Payment> filteredPayments(String status, String from, String to) {
        return paymentRepository.findAll().stream()
                .filter(p -> matchesStatus(status, p.getStatus() != null ? p.getStatus().name() : null))
                .filter(p -> matchesRange(from, to, p.getPaidAt()))
                .sorted(Comparator.comparing(Payment::getPaidAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Payment::getId, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    private boolean matchesStatus(String requested, String actual) {
        if (requested == null || requested.isBlank() || "ALL".equalsIgnoreCase(requested)) {
            return true;
        }
        return requested.equalsIgnoreCase(actual);
    }

    private boolean matchesRange(String from, String to, LocalDateTime value) {
        if (value == null) {
            return isBlankRange(from, to);
        }
        LocalDate day = value.toLocalDate();
        LocalDate fromDate = parseDate(from);
        LocalDate toDate = parseDate(to);
        if (fromDate != null && day.isBefore(fromDate)) return false;
        if (toDate != null && day.isAfter(toDate)) return false;
        return true;
    }

    private boolean isBlankRange(String from, String to) {
        return isBlank(from) && isBlank(to);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private LocalDate parseDate(String s) {
        if (isBlank(s)) return null;
        try {
            return LocalDate.parse(s);
        } catch (Exception e) {
            return null;
        }
    }
}
