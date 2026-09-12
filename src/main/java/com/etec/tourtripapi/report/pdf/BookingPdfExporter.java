package com.etec.tourtripapi.report.pdf;

import com.etec.tourtripapi.booking.entity.Booking;
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
public class BookingPdfExporter {

    public ByteArrayInputStream export(List<Booking> bookings) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate()); // Landscape mode for more columns

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Title Font
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Tour Bookings Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Table Setup (7 columns)
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 3f, 3f, 1.5f, 2f, 2f, 2.5f});

            // Table Header Style
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"ID", "User Email", "Tour Title", "Slots", "Total Price", "Status", "Date"};

            for (String headerTitle : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(headerTitle, headerFont));
                headerCell.setBackgroundColor(new Color(41, 128, 185));
                headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                headerCell.setPadding(8);
                table.addCell(headerCell);
            }

            // Table Data Rows
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            for (Booking booking : bookings) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(booking.getId()), dataFont)));
                table.addCell(new PdfPCell(new Phrase(booking.getUser() != null ? booking.getUser().getEmail() : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase(booking.getSchedule() != null && booking.getSchedule().getTour() != null ? booking.getSchedule().getTour().getTitle() : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(booking.getNumberOfParticipants()), dataFont)));
                table.addCell(new PdfPCell(new Phrase("$" + booking.getTotalPrice(), dataFont)));
                table.addCell(new PdfPCell(new Phrase(booking.getStatus() != null ? booking.getStatus().name() : "N/A", dataFont)));
                table.addCell(new PdfPCell(new Phrase(booking.getBookingDate() != null ? booking.getBookingDate().toString() : "N/A", dataFont)));
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to export data to PDF file: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}