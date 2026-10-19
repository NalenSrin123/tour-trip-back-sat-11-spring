package com.etec.tourtripapi.review.repository;

import com.etec.tourtripapi.review.entity.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>, JpaSpecificationExecutor<Review> {
    List<Review> findByTourId(Long tourId);
    List<Review> findByTourId(Long tourId, Pageable pageable);
    List<Review> findAllByOrderByCreatedAtDesc();
    boolean existsByBookingId(Long bookingId);

    // AVG computed in SQL instead of loading every review of the tour
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.tour.id = :tourId")
    BigDecimal avgRatingByTourId(@Param("tourId") Long tourId);

    long countByTourId(Long tourId);
}