package com.etec.tourtripapi.tour.service;

import com.etec.tourtripapi.category.entity.Category;
import com.etec.tourtripapi.category.repository.CategoryRepository;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.common.service.FileStorageService; // ✅ Import file storage service
import com.etec.tourtripapi.destination.entity.Destination;
import com.etec.tourtripapi.destination.repository.DestinationRepository;
import com.etec.tourtripapi.tour.dto.request.TourRequest;
import com.etec.tourtripapi.tour.dto.response.TourResponse;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.entity.TourImage;
import com.etec.tourtripapi.tour.mapper.TourMapper;
import com.etec.tourtripapi.tour.repository.TourRepository;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final DestinationRepository destinationRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TourMapper tourMapper;
    private final FileStorageService fileStorageService; // ✅ Injected service

    @Override
    public TourResponse createTour(TourRequest request, String userEmail) {
        Destination destination = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Tour tour = new Tour();
        tour.setTitle(request.getTitle());
        tour.setDescription(request.getDescription());
        tour.setDestination(destination);
        tour.setCategory(category);
        tour.setCreatedBy(user);
        tour.setPrice(request.getPrice());
        tour.setDurationDays(request.getDurationDays());
        tour.setMaxGroupSize(request.getMaxGroupSize());
        tour.setItinerary(request.getItinerary());
        tour.setIncludedItems(request.getIncludedItems());
        tour.setExcludedItems(request.getExcludedItems());
        tour.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : true);

        // Handle multiple image files upload from laptop
        if (request.getImageFiles() != null && !request.getImageFiles().isEmpty()) {
            List<TourImage> images = request.getImageFiles().stream()
                    .filter(file -> !file.isEmpty())
                    .map(file -> {
                        String fileUrl = fileStorageService.storeFile(file);
                        TourImage img = new TourImage();
                        img.setImageUrl(fileUrl);
                        img.setTour(tour);
                        return img;
                    }).collect(Collectors.toList());
            tour.setImages(images);
        }

        Tour savedTour = tourRepository.save(tour);
        return tourMapper.toResponse(savedTour);
    }

    @Override
    public List<TourResponse> getAllTours(Specification<Tour> spec) {
        List<Tour> tours = tourRepository.findAll(spec);
        return tours.stream()
                .map(tourMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TourResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));
        return tourMapper.toResponse(tour);
    }

    @Override
    public TourResponse updateTour(Long id, TourRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));

        if (request.getTitle() != null) tour.setTitle(request.getTitle());
        if (request.getDescription() != null) tour.setDescription(request.getDescription());
        if (request.getPrice() != null) tour.setPrice(request.getPrice());
        if (request.getDurationDays() != null) tour.setDurationDays(request.getDurationDays());
        if (request.getMaxGroupSize() != null) tour.setMaxGroupSize(request.getMaxGroupSize());
        if (request.getItinerary() != null) tour.setItinerary(request.getItinerary());
        if (request.getIncludedItems() != null) tour.setIncludedItems(request.getIncludedItems());
        if (request.getExcludedItems() != null) tour.setExcludedItems(request.getExcludedItems());
        if (request.getIsPublished() != null) tour.setIsPublished(request.getIsPublished());

        // Handle updating images if new files are uploaded
        if (request.getImageFiles() != null && !request.getImageFiles().isEmpty()) {
            List<TourImage> newImages = request.getImageFiles().stream()
                    .filter(file -> !file.isEmpty())
                    .map(file -> {
                        String fileUrl = fileStorageService.storeFile(file);
                        TourImage img = new TourImage();
                        img.setImageUrl(fileUrl);
                        img.setTour(tour);
                        return img;
                    }).collect(Collectors.toList());
            tour.getImages().clear();
            tour.getImages().addAll(newImages);
        }

        Tour updatedTour = tourRepository.save(tour);
        return tourMapper.toResponse(updatedTour);
    }

    @Override
    public void deleteTour(Long id) {
        if (!tourRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tour not found with id: " + id);
        }
        tourRepository.deleteById(id);
    }
}