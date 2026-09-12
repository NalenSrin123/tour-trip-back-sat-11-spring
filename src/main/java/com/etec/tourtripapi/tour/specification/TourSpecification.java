package com.etec.tourtripapi.tour.specification;

import com.etec.tourtripapi.tour.entity.Tour;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class TourSpecification {

    public static Specification<Tour> hasDestinationId(Long destinationId) {
        return (root, query, criteriaBuilder) ->
                destinationId == null ? null : criteriaBuilder.equal(root.get("destination").get("id"), destinationId);
    }

    public static Specification<Tour> hasCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) ->
                categoryId == null ? null : criteriaBuilder.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Tour> maxPrice(BigDecimal price) {
        return (root, query, criteriaBuilder) ->
                price == null ? null : criteriaBuilder.lessThanOrEqualTo(root.get("price"), price);
    }

    public static Specification<Tour> hasDurationDays(Integer durationDays) {
        return (root, query, criteriaBuilder) ->
                durationDays == null ? null : criteriaBuilder.equal(root.get("durationDays"), durationDays);
    }

    public static Specification<Tour> isPublished(Boolean isPublished) {
        return (root, query, criteriaBuilder) ->
                isPublished == null ? null : criteriaBuilder.equal(root.get("isPublished"), isPublished);
    }
}