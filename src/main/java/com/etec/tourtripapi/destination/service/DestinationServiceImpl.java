package com.etec.tourtripapi.destination.service;

import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.common.service.FileStorageService;
import com.etec.tourtripapi.destination.dto.request.DestinationRequest;
import com.etec.tourtripapi.destination.dto.response.DestinationResponse;
import com.etec.tourtripapi.destination.entity.Destination;
import com.etec.tourtripapi.destination.mapper.DestinationMapper;
import com.etec.tourtripapi.destination.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;
    private final DestinationMapper destinationMapper;
    private final FileStorageService fileStorageService;

    @Override
    public DestinationResponse createDestination(DestinationRequest request) {
        if (destinationRepository.existsByName(request.getName())) {
            throw new ConflictException("Destination with name '" + request.getName() + "' already exists!");
        }

        // Store image file if provided via laptop form dialog
        String imageUrl = null;
        List<String> imageUrls = new ArrayList<>();

        if (request.getImageFiles() != null && !request.getImageFiles().isEmpty()) {
            for (var f : request.getImageFiles()) {
                if (f != null && !f.isEmpty()) {
                    String u = fileStorageService.storeFile(f);
                    imageUrls.add(u);
                }
            }
        }
        if (request.getImageFile() != null && !request.getImageFile().isEmpty() && imageUrls.isEmpty()) {
            imageUrl = fileStorageService.storeFile(request.getImageFile());
            imageUrls.add(imageUrl);
        }

        if (imageUrls.isEmpty()) {
            imageUrl = null;
        } else {
            imageUrl = imageUrls.get(0);
        }

        Destination destination = new Destination();
        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setDescription(request.getDescription());
        destination.setImageUrl(imageUrl);
        destination.setImages(imageUrls);

        return destinationMapper.toResponse(destinationRepository.save(destination));
    }

    @Override
    public DestinationResponse updateDestination(Long id, DestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));

        if (request.getName() != null) destination.setName(request.getName());
        if (request.getCountry() != null) destination.setCountry(request.getCountry());
        if (request.getDescription() != null) destination.setDescription(request.getDescription());

        List<String> imageUrls = new ArrayList<>(destination.getImages() != null ? destination.getImages() : List.of());
        boolean imagesChanged = false;
        List<String> newlyUploaded = new ArrayList<>();

        // Remove images the client asked to delete
        List<String> toDelete = request.getImagesToDelete() != null ? request.getImagesToDelete() : List.of();
        if (!toDelete.isEmpty()) {
            imageUrls.removeAll(toDelete);
            imagesChanged = true;
        }

        // Append newly uploaded files
        if (request.getImageFiles() != null && !request.getImageFiles().isEmpty()) {
            for (var f : request.getImageFiles()) {
                if (f != null && !f.isEmpty()) {
                    String u = fileStorageService.storeFile(f);
                    imageUrls.add(u);
                    newlyUploaded.add(u);
                    imagesChanged = true;
                }
            }
        }
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            String u = fileStorageService.storeFile(request.getImageFile());
            imageUrls.add(u);
            newlyUploaded.add(u);
            imagesChanged = true;
        }

        if (imagesChanged) {
            destination.setImages(imageUrls);
            String cover = destination.getImageUrl();
            if (!newlyUploaded.isEmpty()) {
                // The most recently uploaded image becomes the cover so the edit is
                // immediately visible in the admin table and on the storefront.
                destination.setImageUrl(newlyUploaded.get(0));
            } else if (cover == null || cover.isBlank() || !imageUrls.contains(cover)) {
                // Reset the cover if it is missing or was removed from the gallery
                destination.setImageUrl(imageUrls.isEmpty() ? null : imageUrls.get(0));
            }
        }

        return destinationMapper.toResponse(destinationRepository.save(destination));
    }

    @Override
    public void deleteDestination(Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found with id: " + id);
        }
        destinationRepository.deleteById(id);
    }

    @Override
    public DestinationResponse getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
        return destinationMapper.toResponse(destination);
    }

    @Override
    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(destinationMapper::toResponse)
                .collect(Collectors.toList());
    }
}