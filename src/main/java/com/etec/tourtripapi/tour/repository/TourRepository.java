package com.etec.tourtripapi.tour.repository;

import com.etec.tourtripapi.tour.entity.Tour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {
    boolean existsByTitle(String title);

    @EntityGraph(attributePaths = {"images"})
    Optional<Tour> findByTitle(String title);

    // Fetch-join graph for list endpoints: avoids N+1 on destination/category/createdBy/images
    @Override
    @EntityGraph(attributePaths = {"destination", "category", "createdBy", "images"})
    List<Tour> findAll(Specification<Tour> spec, Sort sort);

    // Pageable query: join only the many-to-one associations. Joining the images
    // collection here would force Hibernate to paginate in memory. The images are
    // still fetched efficiently via @BatchSize / default_batch_fetch_size.
    @Override
    @EntityGraph(attributePaths = {"destination", "category", "createdBy"})
    Page<Tour> findAll(Specification<Tour> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"destination", "category", "createdBy", "images"})
    Optional<Tour> findById(Long id);

    // Aggregate counts for the homepage facets (GROUP BY, no entity loading)
    @Query("SELECT t.destination.name, COUNT(t) FROM Tour t WHERE t.isPublished = true GROUP BY t.destination.name")
    List<Object[]> countPublishedByDestination();

    @Query("SELECT t.category.name, COUNT(t) FROM Tour t WHERE t.isPublished = true GROUP BY t.category.name")
    List<Object[]> countPublishedByCategory();
}