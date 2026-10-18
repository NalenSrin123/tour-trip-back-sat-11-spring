package com.etec.tourtripapi.schedule.service;

import com.etec.tourtripapi.common.enums.ScheduleStatus;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.common.response.PageResponse;
import com.etec.tourtripapi.schedule.dto.request.TourScheduleRequest;
import com.etec.tourtripapi.schedule.dto.response.TourScheduleResponse;
import com.etec.tourtripapi.schedule.entity.TourSchedule;
import com.etec.tourtripapi.schedule.mapper.TourScheduleMapper;
import com.etec.tourtripapi.schedule.repository.TourScheduleRepository;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourScheduleServiceImpl implements TourScheduleService {

    private final TourScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;
    private final TourScheduleMapper scheduleMapper;

    @Override
    public List<TourScheduleResponse> getAllSchedules() {
        return scheduleRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<TourScheduleResponse> getSchedules(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
        Page<TourSchedule> result = scheduleRepository.findAll(pageable);
        List<TourScheduleResponse> content = result.getContent().stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
        return PageResponse.of(content, safePage, safeSize, result.getTotalElements());
    }


    @Override
    public TourScheduleResponse createSchedule(Long tourId, TourScheduleRequest request) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + tourId));

        TourSchedule schedule = new TourSchedule();
        schedule.setTour(tour);
        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());
        schedule.setAvailableSlots(request.getAvailableSlots());

        // Default to ACTIVE if status is not provided in request
        schedule.setStatus(request.getStatus() != null ? request.getStatus() : ScheduleStatus.ACTIVE);

        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    public List<TourScheduleResponse> getSchedulesByTourId(Long tourId) {
        if (!tourRepository.existsById(tourId)) {
            throw new ResourceNotFoundException("Tour not found with id: " + tourId);
        }
        return scheduleRepository.findByTourId(tourId).stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TourScheduleResponse getScheduleById(Long id) {
        TourSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        return scheduleMapper.toResponse(schedule);
    }

    @Override
    public TourScheduleResponse updateSchedule(Long id, TourScheduleRequest request) {
        TourSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        if (request.getStartDate() != null) schedule.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) schedule.setEndDate(request.getEndDate());
        if (request.getAvailableSlots() != null) schedule.setAvailableSlots(request.getAvailableSlots());
        if (request.getStatus() != null) schedule.setStatus(request.getStatus());

        return scheduleMapper.toResponse(scheduleRepository.save(schedule));
    }

    @Override
    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Schedule not found with id: " + id);
        }
        scheduleRepository.deleteById(id);
    }


}