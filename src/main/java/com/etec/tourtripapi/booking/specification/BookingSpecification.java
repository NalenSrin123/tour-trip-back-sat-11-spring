package com.etec.tourtripapi.booking.specification;

import com.etec.tourtripapi.booking.entity.Booking;
import com.etec.tourtripapi.common.enums.BookingStatus;
import org.springframework.data.jpa.domain.Specification;

public class BookingSpecification {

    public static Specification<Booking> hasStatus(String statusStr) {
        return (root, query, criteriaBuilder) -> {
            if (statusStr == null || statusStr.trim().isEmpty()) {
                return null;
            }
            try {
                BookingStatus status = BookingStatus.valueOf(statusStr.toUpperCase());
                return criteriaBuilder.equal(root.get("status"), status);
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
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