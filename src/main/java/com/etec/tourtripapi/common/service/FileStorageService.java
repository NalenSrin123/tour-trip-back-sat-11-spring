package com.etec.tourtripapi.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
    private final Cloudinary cloudinary;
    private final String folder;

    public FileStorageService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${cloudinary.folder:tour-trip}") String folder) {
        this.folder = folder;
        if (cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName.trim(),
                    "api_key", apiKey.trim(),
                    "api_secret", apiSecret.trim(),
                    "secure", true));
        } else {
            this.cloudinary = null;
        }
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    /**
     * Stores an uploaded file and returns a public URL. When Cloudinary is configured the
     * file lives in the cloud (surviving redeploys); otherwise it falls back to the local
     * ./uploads folder so offline development still works.
     */
    public String storeFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();

        if (originalFileName != null && originalFileName.contains("..")) {
            throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
        }

        if (cloudinary != null) {
            return storeInCloudinary(file);
        }
        return storeLocally(file, originalFileName);
    }

    @SuppressWarnings("unchecked")
    private String storeInCloudinary(MultipartFile file) {
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "use_filename", true,
                    "unique_filename", true);
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), options);
            Object secureUrl = result.get("secure_url");
            if (secureUrl == null) {
                secureUrl = result.get("url");
            }
            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary upload returned no URL");
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not upload file to Cloudinary. Please try again!", ex);
        }
    }

    private String storeLocally(MultipartFile file, String originalFileName) {
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Automatically builds the full URL (e.g., http://localhost:8080/api/v1/files/filename.jpg)
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/v1/files/")
                    .path(uniqueFileName)
                    .toUriString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
}
