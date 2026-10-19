package com.etec.tourtripapi.review.service;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.booking.repository.BookingRepository;
import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import com.etec.tourtripapi.review.dto.request.ReviewRequest;
import com.etec.tourtripapi.review.dto.response.ReviewResponse;
import com.etec.tourtripapi.review.entity.Review;
import com.etec.tourtripapi.review.mapper.ReviewMapper;
import com.etec.tourtripapi.review.repository.ReviewRepository;
import com.etec.tourtripapi.common.response.PageResponse;
import com.etec.tourtripapi.tour.entity.Tour;
import com.etec.tourtripapi.tour.repository.TourRepository;
import com.etec.tourtripapi.user.entity.User;
import com.etec.tourtripapi.user.repository.UserRepository;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        // Ensure the booking belongs to this user
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ConflictException("You can only review tours from your own bookings!");
        }

        // Check if a review for this booking already exists
        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new ConflictException("You have already reviewed this booking!");
        }

        Tour tour = booking.getSchedule().getTour();

        Review review = new Review();
        review.setUser(user);
        review.setTour(tour);
        review.setBooking(booking);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);

        // Recalculate and update the tour's average rating
        updateTourAverageRating(tour);

        return reviewMapper.toResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<ReviewResponse> getReviews(String search, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));

        Specification<Review> spec = (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String like = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("comment")), like),
                    cb.like(cb.lower(root.join("user", JoinType.LEFT).get("fullName")), like),
                    cb.like(cb.lower(root.join("tour", JoinType.LEFT).get("title")), like)
            );
        };

        Page<Review> result = reviewRepository.findAll(spec, pageable);
        List<ReviewResponse> content = result.getContent().stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
        return PageResponse.of(content, safePage, safeSize, result.getTotalElements());
    }

    @Override
    public List<ReviewResponse> getReviewsByTourId(Long tourId) {
        if (!tourRepository.existsById(tourId)) {
            throw new ResourceNotFoundException("Tour not found with id: " + tourId);
        }
        // Cap at 20 newest reviews so the public endpoint never returns an unbounded list
        return reviewRepository.findByTourId(tourId, PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))).stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        Tour tour = review.getTour();

        reviewRepository.delete(review);

        // Recalculate average rating after deletion
        updateTourAverageRating(tour);
    }

    private void updateTourAverageRating(Tour tour) {
        // AVG computed in SQL — does not load every review of the tour
        BigDecimal avg = reviewRepository.avgRatingByTourId(tour.getId());
        long total = reviewRepository.countByTourId(tour.getId());
        if (total == 0 || avg == null) {
            tour.setRatingAvg(BigDecimal.ZERO);
        } else {
            tour.setRatingAvg(avg.setScale(2, RoundingMode.HALF_UP));
        }
        tourRepository.save(tour);
    }
}