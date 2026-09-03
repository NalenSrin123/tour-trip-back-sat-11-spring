package com.etec.tourtripapi.category.service;

import com.etec.tourtripapi.category.dto.request.CategoryRequest;
import com.etec.tourtripapi.category.dto.response.CategoryResponse;
import com.etec.tourtripapi.category.entity.Category;
import com.etec.tourtripapi.category.mapper.CategoryMapper;
import com.etec.tourtripapi.category.repository.CategoryRepository;
import com.etec.tourtripapi.common.exception.ConflictException;
import com.etec.tourtripapi.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ConflictException("Category with name '" + request.getName() + "' already exists!");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }
}