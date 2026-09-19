package com.etec.tourtripapi.schedule.mapper;

import com.etec.tourtripapi.schedule.dto.response.TourScheduleResponse;
import com.etec.tourtripapi.schedule.entity.TourSchedule;
import org.springframework.stereotype.Component;

@Component
public class TourScheduleMapper {

    public TourScheduleResponse toResponse(TourSchedule schedule) {
        if (schedule == null) return null;

        TourScheduleResponse response = new TourScheduleResponse();
        response.setId(schedule.getId());
        response.setTourId(schedule.getTour() != null ? schedule.getTour().getId() : null);
        response.setTourTitle(schedule.getTour() != null ? schedule.getTour().getTitle() : null);
        response.setStartDate(schedule.getStartDate());
        response.setEndDate(schedule.getEndDate());
        response.setAvailableSlots(schedule.getAvailableSlots());
        response.setStatus(schedule.getStatus()); // Directly assigns ScheduleStatus enum
        return response;
    }
}