package com.etec.tourtripapi.report.excel;

import com.etec.tourtripapi.booking.entity.Booking;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component
public class BookingExcelExporter {

    public ByteArrayInputStream export(List<Booking> bookings) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bookings Report");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "User Email", "Tour Title", "Participants", "Total Price ($)", "Status", "Booking Date"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            for (Booking booking : bookings) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(booking.getId());
                row.createCell(1).setCellValue(booking.getUser() != null ? booking.getUser().getEmail() : "N/A");
                row.createCell(2).setCellValue(booking.getSchedule() != null && booking.getSchedule().getTour() != null ? booking.getSchedule().getTour().getTitle() : "N/A");
                row.createCell(3).setCellValue(booking.getNumberOfParticipants());
                row.createCell(4).setCellValue(booking.getTotalPrice() != null ? booking.getTotalPrice().doubleValue() : 0.0);
                row.createCell(5).setCellValue(booking.getStatus() != null ? booking.getStatus().name() : "N/A");
                row.createCell(6).setCellValue(booking.getBookingDate() != null ? booking.getBookingDate().toString() : "N/A");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export data to Excel file: " + e.getMessage());
        }
    }
}