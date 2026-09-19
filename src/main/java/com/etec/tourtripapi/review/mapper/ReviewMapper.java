package com.etec.tourtripapi.review.mapper;

import com.etec.tourtripapi.review.dto.response.ReviewResponse;
import com.etec.tourtripapi.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        if (review == null) return null;

        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setTourId(review.getTour() != null ? review.getTour().getId() : null);
        response.setTourTitle(review.getTour() != null ? review.getTour().getTitle() : null);
        response.setUserId(review.getUser() != null ? review.getUser().getId() : null);
        response.setUserEmail(review.getUser() != null ? review.getUser().getEmail() : null);
        response.setBookingId(review.getBooking() != null ? review.getBooking().getId() : null);
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());

        return response;
    }
}