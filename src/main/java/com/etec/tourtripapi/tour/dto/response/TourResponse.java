package com.etec.tourtripapi.tour.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TourResponse {
    private Long id;
    private String title;
    private String description;
    private String destinationName;
    private String categoryName;
    private String createdByName;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxGroupSize;
    private String itinerary;
    private String includedItems;
    private String excludedItems;
    private BigDecimal ratingAvg;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private List<String> images;
}