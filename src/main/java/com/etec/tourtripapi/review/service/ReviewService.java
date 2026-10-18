package com.etec.tourtripapi.review.service;


import com.etec.tourtripapi.common.response.PageResponse;
import com.etec.tourtripapi.review.dto.request.ReviewRequest;
import com.etec.tourtripapi.review.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request, String userEmail);
    List<ReviewResponse> getAllReviews();
    PageResponse<ReviewResponse> getReviews(String search, int page, int size);
    List<ReviewResponse> getReviewsByTourId(Long tourId);
    void deleteReview(Long id);
}