package com.etec.tourtripapi.schedule.service;


import com.etec.tourtripapi.schedule.dto.request.TourScheduleRequest;
import com.etec.tourtripapi.schedule.dto.response.TourScheduleResponse;

import java.util.List;

public interface TourScheduleService {
    TourScheduleResponse createSchedule(Long tourId, TourScheduleRequest request);
    List<TourScheduleResponse> getSchedulesByTourId(Long tourId);
    TourScheduleResponse getScheduleById(Long id);
    TourScheduleResponse updateSchedule(Long id, TourScheduleRequest request);
    void deleteSchedule(Long id);
}