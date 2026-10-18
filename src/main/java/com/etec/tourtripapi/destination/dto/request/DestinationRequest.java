package com.etec.tourtripapi.destination.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class DestinationRequest {
    private String name;
    private String country;
    private String description;
    private MultipartFile imageFile;
    private List<MultipartFile> imageFiles;
    private List<String> imagesToDelete;
}