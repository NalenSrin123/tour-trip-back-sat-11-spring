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
import org.springframework.stereotype.Service;

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
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            imageUrl = fileStorageService.storeFile(request.getImageFile());
        }

        Destination destination = new Destination();
        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setDescription(request.getDescription());
        destination.setImageUrl(imageUrl); // Saves the file path link handled by FileController

        return destinationMapper.toResponse(destinationRepository.save(destination));
    }

    @Override
    public DestinationResponse updateDestination(Long id, DestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));

        if (request.getName() != null) destination.setName(request.getName());
        if (request.getCountry() != null) destination.setCountry(request.getCountry());
        if (request.getDescription() != null) destination.setDescription(request.getDescription());

        // Update image file if a new file is uploaded
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            String imageUrl = fileStorageService.storeFile(request.getImageFile());
            destination.setImageUrl(imageUrl);
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
        return destinationRepository.findAll().stream()
                .map(destinationMapper::toResponse)
                .collect(Collectors.toList());
    }
}