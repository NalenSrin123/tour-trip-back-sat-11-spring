package com.etec.tourtripapi.destination.dto.request;

import lombok.Data;

@Data
public class DestinationRequest {
    private String name;
    private String country;
    private String description;
    private String imageUrl;
}