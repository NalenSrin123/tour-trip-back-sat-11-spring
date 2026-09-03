package com.etec.tourtripapi.user.specification;

import com.etec.tourtripapi.user.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> hasFullName(String fullName) {
        return (root, query, criteriaBuilder) ->
                fullName == null ? null : criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), "%" + fullName.toLowerCase() + "%");
    }

    public static Specification<User> hasEmail(String email) {
        return (root, query, criteriaBuilder) ->
                email == null ? null : criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + email.toLowerCase() + "%");
    }

    public static Specification<User> isActive(Boolean active) {
        return (root, query, criteriaBuilder) ->
                active == null ? null : criteriaBuilder.equal(root.get("active"), active);
    }
}