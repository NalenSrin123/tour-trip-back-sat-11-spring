package com.etec.tourtripapi.tour.service;

import com.etec.tourtripapi.tour.dto.request.TourRequest;
import com.etec.tourtripapi.tour.dto.response.TourResponse;
import org.springframework.data.jpa.domain.Specification;
import com.etec.tourtripapi.tour.entity.Tour;

import java.util.List;

public interface TourService {
    TourResponse createTour(TourRequest request, String userEmail);
    List<TourResponse> getAllTours(Specification<Tour> spec);
    TourResponse getTourById(Long id);
    TourResponse updateTour(Long id, TourRequest request);
    void deleteTour(Long id);
}