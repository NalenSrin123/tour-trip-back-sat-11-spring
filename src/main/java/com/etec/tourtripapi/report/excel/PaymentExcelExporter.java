package com.etec.tourtripapi.report.excel;

import com.etec.tourtripapi.payment.entity.Payment;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component
public class PaymentExcelExporter {

    public ByteArrayInputStream export(List<Payment> payments) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payments Report");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Transaction ID", "Booking ID", "User Email", "Method", "Amount ($)", "Status", "Paid At"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Payment payment : payments) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(payment.getId());
                row.createCell(1).setCellValue(payment.getTransactionId() != null ? payment.getTransactionId() : "N/A");
                row.createCell(2).setCellValue(payment.getBooking() != null ? payment.getBooking().getId() : 0L);
                row.createCell(3).setCellValue(
                        payment.getBooking() != null && payment.getBooking().getUser() != null
                                ? payment.getBooking().getUser().getEmail() : "N/A");
                row.createCell(4).setCellValue(payment.getMethod() != null ? payment.getMethod() : "N/A");
                row.createCell(5).setCellValue(payment.getAmount() != null ? payment.getAmount().doubleValue() : 0.0);
                row.createCell(6).setCellValue(payment.getStatus() != null ? payment.getStatus().name() : "N/A");
                row.createCell(7).setCellValue(payment.getPaidAt() != null ? payment.getPaidAt().toString() : "N/A");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export payments to Excel file: " + e.getMessage());
        }
    }
}
