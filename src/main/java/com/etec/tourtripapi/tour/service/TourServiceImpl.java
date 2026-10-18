package com.etec.tourtripapi.tour.service;

import com.etec.tourtripapi.category.entity.Category;
import com.etec.tourtripapi.category.repository.CategoryRepository;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.common.service.FileStorageService;
import com.etec.tourtripapi.destination.entity.Destination;
import com.etec.tourtripapi.destination.repository.DestinationRepository;
import com.etec.tourtripapi.tour.dto.request.TourRequest;
import com.etec.tourtripapi.tour.dto.response.TourResponse;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.entity.TourImage;
import com.etec.tourtripapi.tour.mapper.TourMapper;
import com.etec.tourtripapi.tour.repository.TourImageRepository;
import com.etec.tourtripapi.tour.repository.TourRepository;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    private final FileStorageService fileStorageService;
    private final TourImageRepository tourImageRepository;

    @Override
    @Transactional
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

        if (request.getImageFiles() != null && !request.getImageFiles().isEmpty()) {
            List<TourImage> images = new ArrayList<>();
            int order = 0;
            for (var file : request.getImageFiles()) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                TourImage img = new TourImage();
                img.setImageUrl(fileStorageService.storeFile(file));
                img.setTour(tour);
                img.setSortOrder(order);
                img.setIsCover(order == 0);
                images.add(img);
                order++;
            }
            tour.setImages(images);
        }

        Tour savedTour = tourRepository.save(tour);
        return tourMapper.toResponse(savedTour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourResponse> getAllTours(Specification<Tour> spec) {
        List<Tour> tours = tourRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "id"));
        return tours.stream()
                .map(tourMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TourResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));
        return tourMapper.toResponse(tour);
    }

    @Override
    @Transactional
    public void deleteTour(Long id) {
        if (!tourRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tour not found with id: " + id);
        }
        tourRepository.deleteById(id);
    }

    @Override
    @Transactional
    public TourResponse updateTour(Long id, TourRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Tour not found with id: " + id)
                );

        // ---------- Update tour details ----------
        if (request.getTitle() != null) {
            tour.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            tour.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            tour.setPrice(request.getPrice());
        }

        if (request.getDurationDays() != null) {
            tour.setDurationDays(request.getDurationDays());
        }

        if (request.getMaxGroupSize() != null) {
            tour.setMaxGroupSize(request.getMaxGroupSize());
        }

        if (request.getItinerary() != null) {
            tour.setItinerary(request.getItinerary());
        }

        if (request.getIncludedItems() != null) {
            tour.setIncludedItems(request.getIncludedItems());
        }

        if (request.getExcludedItems() != null) {
            tour.setExcludedItems(request.getExcludedItems());
        }

        if (request.getIsPublished() != null) {
            tour.setIsPublished(request.getIsPublished());
        }

        // ---------- Update destination and category ----------
        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination not found"));
            tour.setDestination(destination);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            tour.setCategory(category);
        }

        // ---------- Delete selected images (the Hibernate way) ----------
        // Removing the image from the Tour's collection makes it an orphan.
        // Because orphanRemoval = true on Tour.images, Hibernate deletes the row.
        if (request.getImagesToDelete() != null
                && !request.getImagesToDelete().isEmpty()
                && tour.getImages() != null) {

            tour.getImages().removeIf(img ->
                    img.getId() != null && request.getImagesToDelete().contains(img.getId())
            );
        }

        // ---------- Upload and add new images ----------
        if (request.getImageFiles() != null
                && !request.getImageFiles().isEmpty()) {

            List<TourImage> newImages = new ArrayList<>();
            for (var file : request.getImageFiles()) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                TourImage img = new TourImage();
                img.setImageUrl(fileStorageService.storeFile(file));
                img.setTour(tour);
                newImages.add(img);
            }

            if (!newImages.isEmpty()) {
                if (tour.getImages() == null) {
                    tour.setImages(new ArrayList<>());
                }
                // The most recently uploaded image becomes the cover so the edit is
                // immediately visible in the admin table and on the storefront.
                tour.getImages().forEach(img -> img.setIsCover(false));
                newImages.get(0).setIsCover(true);
                newImages.get(0).setSortOrder(0);
                tour.getImages().addAll(newImages);
            }
        }

        // ---------- Save updated tour ----------
        Tour updatedTour = tourRepository.save(tour);

        return tourMapper.toResponse(updatedTour);
    }
}