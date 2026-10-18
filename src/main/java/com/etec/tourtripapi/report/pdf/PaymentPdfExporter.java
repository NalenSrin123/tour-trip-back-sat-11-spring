package com.etec.tourtripapi.report.pdf;

import com.etec.tourtripapi.payment.entity.Payment;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
public class PaymentPdfExporter {

    public ByteArrayInputStream export(List<Payment> payments) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Payments & Revenue Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 2.5f, 1.5f, 3f, 2f, 2f, 2f, 2.5f});

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"ID", "Transaction", "Booking", "User Email", "Method", "Amount", "Status", "Paid At"};

            for (String headerTitle : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(headerTitle, headerFont));
                headerCell.setBackgroundColor(new Color(39, 174, 96));
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                headerCell.setPadding(8);
                table.addCell(headerCell);
            }

            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            for (Payment payment : payments) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(payment.getId()), dataFont)));
                table.addCell(new PdfPCell(new Phrase(payment.getTransactionId() != null ? payment.getTransactionId() : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase(payment.getBooking() != null ? String.valueOf(payment.getBooking().getId()) : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase(
                        payment.getBooking() != null && payment.getBooking().getUser() != null
                                ? payment.getBooking().getUser().getEmail() : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase(payment.getMethod() != null ? payment.getMethod() : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase("$" + payment.getAmount(), dataFont)));
                table.addCell(new PdfPCell(new Phrase(payment.getStatus() != null ? payment.getStatus().name() : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase(payment.getPaidAt() != null ? payment.getPaidAt().toString() : "N/A", dataFont)));
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to export payments to PDF file: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
