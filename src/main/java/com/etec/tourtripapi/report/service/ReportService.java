package com.etec.tourtripapi.report.service;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream exportBookingsExcel();
    ByteArrayInputStream exportBookingsPdf();
}