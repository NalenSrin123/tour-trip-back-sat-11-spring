package com.etec.tourtripapi.destination.mapper;

import com.etec.tourtripapi.destination.dto.response.DestinationResponse;
import com.etec.tourtripapi.destination.entity.Destination;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DestinationMapper {

    public DestinationResponse toResponse(Destination destination) {
        if (destination == null) return null;

        DestinationResponse response = new DestinationResponse();
        response.setId(destination.getId());
        response.setName(destination.getName());
        response.setCountry(destination.getCountry());
        response.setDescription(destination.getDescription());
        response.setImageUrl(destination.getImageUrl());

        if (destination.getImages() != null && !destination.getImages().isEmpty()) {
            response.setImages(new ArrayList<>(destination.getImages()));
            if (response.getImageUrl() == null || response.getImageUrl().isBlank()) {
                response.setImageUrl(destination.getImages().get(0));
            }
        }
        return response;
    }
}