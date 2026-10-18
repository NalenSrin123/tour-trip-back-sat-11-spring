package com.etec.tourtripapi.report.service;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream exportBookingsExcel(String status, String from, String to);
    ByteArrayInputStream exportBookingsPdf(String status, String from, String to);
    ByteArrayInputStream exportPaymentsExcel(String status, String from, String to);
    ByteArrayInputStream exportPaymentsPdf(String status, String from, String to);
}
