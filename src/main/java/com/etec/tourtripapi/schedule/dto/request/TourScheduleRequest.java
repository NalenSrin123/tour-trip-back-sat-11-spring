package com.etec.tourtripapi.schedule.dto.request;

import com.etec.tourtripapi.common.enums.ScheduleStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TourScheduleRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer availableSlots;
    private ScheduleStatus status; // Changed from String to ScheduleStatus enum
}