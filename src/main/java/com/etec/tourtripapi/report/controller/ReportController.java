package com.etec.tourtripapi.report.controller;

import com.etec.tourtripapi.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/bookings/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadBookingsExcel(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        ByteArrayInputStream inputStream = reportService.exportBookingsExcel(status, from, to);
        InputStreamResource file = new InputStreamResource(inputStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/bookings/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadBookingsPdf(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        ByteArrayInputStream inputStream = reportService.exportBookingsPdf(status, from, to);
        InputStreamResource file = new InputStreamResource(inputStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @GetMapping("/payments/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadPaymentsExcel(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        ByteArrayInputStream inputStream = reportService.exportPaymentsExcel(status, from, to);
        InputStreamResource file = new InputStreamResource(inputStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payments-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/payments/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadPaymentsPdf(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        ByteArrayInputStream inputStream = reportService.exportPaymentsPdf(status, from, to);
        InputStreamResource file = new InputStreamResource(inputStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payments-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}