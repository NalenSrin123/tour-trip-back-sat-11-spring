package com.etec.tourtripapi.tour.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TourRequest {
    private String title;
    private String description;
    private Long destinationId;
    private Long categoryId;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxGroupSize;
    private String itinerary;
    private String includedItems;
    private String excludedItems;
    private Boolean isPublished;
    private List<MultipartFile> imageFiles;
}