package com.etec.tourtripapi.schedule.controller;

import com.etec.tourtripapi.common.response.PageResponse;
import com.etec.tourtripapi.schedule.dto.request.TourScheduleRequest;
import com.etec.tourtripapi.schedule.dto.response.TourScheduleResponse;
import com.etec.tourtripapi.schedule.service.TourScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TourScheduleController {

    private final TourScheduleService scheduleService;

    @GetMapping("/schedules")
    public ResponseEntity<List<TourScheduleResponse>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }

    @GetMapping("/schedules/page")
    public ResponseEntity<PageResponse<TourScheduleResponse>> getSchedulesPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(scheduleService.getSchedules(page, size));
    }

    @PostMapping("/tours/{tourId}/schedules")
    public ResponseEntity<TourScheduleResponse> createSchedule(
            @PathVariable Long tourId,
            @RequestBody TourScheduleRequest request) {
        TourScheduleResponse response = scheduleService.createSchedule(tourId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/tours/{tourId}/schedules")
    public ResponseEntity<List<TourScheduleResponse>> getSchedulesByTourId(@PathVariable Long tourId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByTourId(tourId));
    }

    @GetMapping("/schedules/{id}")
    public ResponseEntity<TourScheduleResponse> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getScheduleById(id));
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<TourScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @RequestBody TourScheduleRequest request) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, request));
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<String> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok("Tour schedule deleted successfully with id: " + id);
    }
}