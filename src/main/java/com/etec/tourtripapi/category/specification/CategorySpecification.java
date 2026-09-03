package com.etec.tourtripapi.category.specification;

import com.etec.tourtripapi.category.entity.Category;
import org.springframework.data.jpa.domain.Specification;

public class CategorySpecification {

    public static Specification<Category> hasName(String name) {
        return (root, query, criteriaBuilder) ->
                (name == null || name.isEmpty()) ? null : criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Category> hasDescription(String description) {
        return (root, query, criteriaBuilder) ->
                (description == null || description.isEmpty()) ? null : criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), "%" + description.toLowerCase() + "%");
    }
}