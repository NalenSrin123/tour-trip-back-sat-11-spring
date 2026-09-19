package com.etec.tourtripapi.review.controller;

import com.etec.tourtripapi.review.dto.request.ReviewRequest;
import com.etec.tourtripapi.review.dto.response.ReviewResponse;
import com.etec.tourtripapi.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> createReview(@RequestBody ReviewRequest request, Authentication authentication) {
        ReviewResponse response = reviewService.createReview(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/tours/{tourId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviewsByTourId(@PathVariable Long tourId) {
        return ResponseEntity.ok(reviewService.getReviewsByTourId(tourId));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok("Review deleted successfully with id: " + id);
    }
}