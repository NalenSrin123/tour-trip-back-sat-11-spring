package com.etec.tourtripapi.destination.dto.response;

import lombok.Data;

@Data
public class DestinationResponse {
    private Long id;
    private String name;
    private String country;
    private String description;
    private String imageUrl;
}