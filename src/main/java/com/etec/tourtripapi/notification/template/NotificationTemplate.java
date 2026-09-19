package com.etec.tourtripapi.notification.template;

import org.springframework.stereotype.Component;

@Component
public class NotificationTemplate {

    public String getBookingConfirmationTemplate(String userName, String tourTitle, String startDate, Double totalPrice) {
        return """
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #2c3e50;">Booking Confirmation</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Thank you for booking with us! Your reservation for <b>%s</b> has been successfully confirmed.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><b>Departure Date:</b> %s</p>
                    <p><b>Total Price:</b> $%s</p>
                </div>
                <p>We look forward to giving you an amazing experience!</p>
                <p>Best regards,<br><b>Tour Trip Team</b></p>
            </div>
            """.formatted(userName, tourTitle, startDate, totalPrice);
    }
}