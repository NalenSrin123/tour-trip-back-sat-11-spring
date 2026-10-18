package com.etec.tourtripapi.destination.dto.response;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class DestinationResponse {
    private Long id;
    private String name;
    private String country;
    private String description;
    private String imageUrl;
    private List<String> images = new ArrayList<>();
}