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
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/bookings/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadBookingsExcel() {
        ByteArrayInputStream inputStream = reportService.exportBookingsExcel();
        InputStreamResource file = new InputStreamResource(inputStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/bookings/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadBookingsPdf() {
        ByteArrayInputStream inputStream = reportService.exportBookingsPdf();
        InputStreamResource file = new InputStreamResource(inputStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}