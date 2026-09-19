package com.etec.tourtripapi.review.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Long tourId;
    private String tourTitle;
    private Long userId;
    private String userEmail;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}