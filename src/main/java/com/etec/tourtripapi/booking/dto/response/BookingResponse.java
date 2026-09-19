package com.etec.tourtripapi.booking.dto.response;

import com.etec.tourtripapi.common.enums.BookingStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private Long tourId;
    private String tourTitle;
    private Long scheduleId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfParticipants;
    private BigDecimal totalPrice;
    private BookingStatus status; // Changed from String to BookingStatus enum
    private LocalDateTime bookingDate;
}