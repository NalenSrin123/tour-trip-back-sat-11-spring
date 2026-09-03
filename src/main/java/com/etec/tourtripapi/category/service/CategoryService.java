package com.etec.tourtripapi.category.service;

import com.etec.tourtripapi.category.dto.request.CategoryRequest;
import com.etec.tourtripapi.category.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    CategoryResponse getCategoryById(Long id);
    List<CategoryResponse> getAllCategories();
}