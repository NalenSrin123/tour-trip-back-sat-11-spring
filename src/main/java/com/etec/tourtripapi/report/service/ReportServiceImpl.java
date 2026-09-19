package com.etec.tourtripapi.report.service;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.report.excel.BookingExcelExporter;
import com.etec.tourtripapi.report.pdf.BookingPdfExporter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final BookingRepository bookingRepository;
    private final BookingExcelExporter excelExporter;
    private final BookingPdfExporter pdfExporter;

    @Override
    public ByteArrayInputStream exportBookingsExcel() {
        List<Booking> bookings = bookingRepository.findAll();
        return excelExporter.export(bookings);
    }

    @Override
    public ByteArrayInputStream exportBookingsPdf() {
        List<Booking> bookings = bookingRepository.findAll();
        return pdfExporter.export(bookings);
    }
}