package com.etec.tourtripapi.schedule.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TourScheduleResponse {
    private Long id;
    private Long tourId;
    private String tourTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer availableSlots;
    private String status;
}