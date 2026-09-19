package com.etec.tourtripapi.booking.dto.request;

import lombok.Data;

@Data
public class BookingRequest {
    private Long scheduleId;
    private Integer numberOfParticipants;
}