package com.etec.tourtripapi.tour.mapper;

import com.etec.tourtripapi.tour.dto.response.TourResponse;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.entity.TourImage;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TourMapper {

    public TourResponse toResponse(Tour tour) {
        if (tour == null) return null;

        TourResponse response = new TourResponse();
        response.setId(tour.getId());
        response.setTitle(tour.getTitle());
        response.setDescription(tour.getDescription());

        if (tour.getDestination() != null) {
            response.setDestinationName(tour.getDestination().getName());
        }
        if (tour.getCategory() != null) {
            response.setCategoryName(tour.getCategory().getName());
        }
        if (tour.getCreatedBy() != null) {
            response.setCreatedByName(tour.getCreatedBy().getFullName());
        }

        response.setPrice(tour.getPrice());
        response.setDurationDays(tour.getDurationDays());
        response.setMaxGroupSize(tour.getMaxGroupSize());
        response.setItinerary(tour.getItinerary());
        response.setIncludedItems(tour.getIncludedItems());
        response.setExcludedItems(tour.getExcludedItems());
        response.setRatingAvg(tour.getRatingAvg());
        response.setIsPublished(tour.getIsPublished());
        response.setCreatedAt(tour.getCreatedAt());

        if (tour.getImages() != null) {
            response.setImages(tour.getImages().stream()
                    .map(TourImage::getImageUrl)
                    .collect(Collectors.toList()));
        }

        return response;
    }
}