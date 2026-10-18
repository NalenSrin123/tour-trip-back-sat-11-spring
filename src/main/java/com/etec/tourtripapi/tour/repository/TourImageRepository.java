package com.etec.tourtripapi.tour.repository;

import com.etec.tourtripapi.tour.entity.TourImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TourImageRepository extends JpaRepository<TourImage, Long> {
}