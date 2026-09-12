package com.etec.tourtripapi.schedule.dto.response;

import com.etec.tourtripapi.common.enums.ScheduleStatus;
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
    private ScheduleStatus status; // Changed from String to ScheduleStatus enum
}