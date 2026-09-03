package com.etec.tourtripapi.destination.service;

import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
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

    @Override
    public DestinationResponse createDestination(DestinationRequest request) {
        if (destinationRepository.existsByName(request.getName())) {
            throw new ConflictException("Destination with name '" + request.getName() + "' already exists!");
        }

        Destination destination = new Destination();
        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setDescription(request.getDescription());
        destination.setImageUrl(request.getImageUrl());

        return destinationMapper.toResponse(destinationRepository.save(destination));
    }

    @Override
    public DestinationResponse updateDestination(Long id, DestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));

        if (request.getName() != null) destination.setName(request.getName());
        if (request.getCountry() != null) destination.setCountry(request.getCountry());
        if (request.getDescription() != null) destination.setDescription(request.getDescription());
        if (request.getImageUrl() != null) destination.setImageUrl(request.getImageUrl());

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