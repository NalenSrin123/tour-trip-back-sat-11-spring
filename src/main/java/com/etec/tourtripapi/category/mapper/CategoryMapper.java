package com.etec.tourtripapi.category.mapper;

import com.etec.tourtripapi.category.dto.response.CategoryResponse;
import com.etec.tourtripapi.category.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) return null;

        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        return response;
    }
}