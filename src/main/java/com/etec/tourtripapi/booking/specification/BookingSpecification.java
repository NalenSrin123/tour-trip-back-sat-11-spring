package com.etec.tourtripapi.booking.specification;

import com.etec.tourtripapi.booking.entity.Booking;
import org.springframework.data.jpa.domain.Specification;

public class BookingSpecification {

    public static Specification<Booking> hasStatus(String status) {
        return (root, query, criteriaBuilder) ->
                (status == null || status.trim().isEmpty()) ? null : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Booking> hasUserId(Long userId) {
        return (root, query, criteriaBuilder) ->
                userId == null ? null : criteriaBuilder.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Booking> hasScheduleId(Long scheduleId) {
        return (root, query, criteriaBuilder) ->
                scheduleId == null ? null : criteriaBuilder.equal(root.get("schedule").get("id"), scheduleId);
    }
}