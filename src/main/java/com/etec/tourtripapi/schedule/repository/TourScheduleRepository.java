package com.etec.tourtripapi.schedule.repository;

import com.etec.tourtripapi.schedule.entity.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {
    List<TourSchedule> findByTourId(Long tourId);
}