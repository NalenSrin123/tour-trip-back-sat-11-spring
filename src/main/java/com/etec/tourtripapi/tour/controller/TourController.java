package com.etec.tourtripapi.tour.controller;

import com.etec.tourtripapi.tour.dto.request.TourRequest;
import com.etec.tourtripapi.tour.dto.response.TourResponse;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.service.TourService;
import com.etec.tourtripapi.tour.specification.TourSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TourResponse> createTour(@ModelAttribute TourRequest request, Authentication authentication) {
        String email = authentication.getName();
        TourResponse response = tourService.createTour(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TourResponse>> getAllTours(
            @RequestParam(required = false) Long destinationId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer durationDays,
            @RequestParam(required = false) Boolean isPublished) {

        Specification<Tour> spec = Specification.where(TourSpecification.hasDestinationId(destinationId))
                .and(TourSpecification.hasCategoryId(categoryId))
                .and(TourSpecification.maxPrice(maxPrice))
                .and(TourSpecification.hasDurationDays(durationDays))
                .and(TourSpecification.isPublished(isPublished));

        List<TourResponse> response = tourService.getAllTours(spec);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourResponse> getTourById(@PathVariable Long id) {
        TourResponse response = tourService.getTourById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TourResponse> updateTour(@PathVariable Long id, @ModelAttribute TourRequest request) {
        TourResponse response = tourService.updateTour(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.ok("Tour deleted successfully with id: " + id);
    }
}