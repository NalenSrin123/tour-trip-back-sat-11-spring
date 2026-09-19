package com.etec.tourtripapi.destination.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DestinationRequest {
    private String name;
    private String country;
    private String description;
    private MultipartFile imageFile;
}