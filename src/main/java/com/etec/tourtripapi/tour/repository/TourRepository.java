package com.etec.tourtripapi.tour.repository;

import com.etec.tourtripapi.tour.entity.Tour;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {
    boolean existsByTitle(String title);

    @EntityGraph(attributePaths = {"images"})
    Optional<Tour> findByTitle(String title);
}