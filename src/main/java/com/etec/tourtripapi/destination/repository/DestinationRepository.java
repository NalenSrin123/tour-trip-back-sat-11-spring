package com.etec.tourtripapi.destination.repository;

import com.etec.tourtripapi.destination.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long>, JpaSpecificationExecutor<Destination> {
    boolean existsByName(String name);
}