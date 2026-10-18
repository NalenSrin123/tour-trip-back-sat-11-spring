package com.etec.tourtripapi.tour.mapper;

import com.etec.tourtripapi.tour.dto.response.ImageResponse;
import com.etec.tourtripapi.tour.dto.response.TourResponse;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.entity.TourImage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
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
        response.setCategoryName(tour.getCategory().getName());
        response.setDestinationName(tour.getDestination().getName());
        response.setDurationDays(tour.getDurationDays());
        response.setMaxGroupSize(tour.getMaxGroupSize());
        response.setItinerary(tour.getItinerary());
        response.setIncludedItems(tour.getIncludedItems());
        response.setExcludedItems(tour.getExcludedItems());
        response.setRatingAvg(tour.getRatingAvg());
        response.setIsPublished(tour.getIsPublished());
        response.setCreatedAt(tour.getCreatedAt());

        if (tour.getImages() != null) {
            // Surface the cover image first so images[0] is stable for the UI.
            List<TourImage> ordered = new ArrayList<>(tour.getImages());
            ordered.sort((a, b) -> Boolean.compare(
                    Boolean.TRUE.equals(b.getIsCover()),
                    Boolean.TRUE.equals(a.getIsCover())));

            response.setImages(
                    ordered.stream()
                            .map(image -> {
                                ImageResponse imageResponse = new ImageResponse();
                                imageResponse.setId(image.getId());
                                imageResponse.setImageUrl(image.getImageUrl());
                                return imageResponse;
                            })
                            .collect(Collectors.toList())
            );
        }

        return response;
    }
}