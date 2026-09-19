package com.etec.tourtripapi.review.repository;

import com.etec.tourtripapi.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTourId(Long tourId);
    boolean existsByBookingId(Long bookingId);
}