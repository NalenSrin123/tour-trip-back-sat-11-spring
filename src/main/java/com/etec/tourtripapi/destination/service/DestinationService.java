package com.etec.tourtripapi.destination.service;

import com.etec.tourtripapi.destination.dto.request.DestinationRequest;
import com.etec.tourtripapi.destination.dto.response.DestinationResponse;

import java.util.List;

public interface DestinationService {
    DestinationResponse createDestination(DestinationRequest request);
    DestinationResponse updateDestination(Long id, DestinationRequest request);
    void deleteDestination(Long id);
    DestinationResponse getDestinationById(Long id);
    List<DestinationResponse> getAllDestinations();
}