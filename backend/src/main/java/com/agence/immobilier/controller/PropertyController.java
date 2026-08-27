package com.agence.immobilier.controller;

import com.agence.immobilier.dto.request.PropertyRequest;
import com.agence.immobilier.dto.response.PropertyResponse;
import com.agence.immobilier.dto.response.PageResponse;
import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.entity.PropertyType;
import com.agence.immobilier.service.PropertyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public List<PropertyResponse> findPublished(@RequestParam(required = false) OperationType operationType) {
        return propertyService.findPublished(operationType);
    }

    @GetMapping("/search")
    public PageResponse<PropertyResponse> searchPublished(
            @RequestParam(required = false) OperationType operationType,
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) java.math.BigDecimal minArea,
            @RequestParam(required = false) PropertyStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        return propertyService.searchPublished(operationType, propertyType, location, minPrice, maxPrice, bedrooms, minArea,
                status, PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @GetMapping("/{slug}")
    public PropertyResponse findPublishedBySlug(@PathVariable String slug) {
        return propertyService.findPublishedBySlug(slug);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<PropertyResponse> findAllForAdmin() {
        return propertyService.findAllForAdmin();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    @ResponseStatus(HttpStatus.CREATED)
    public PropertyResponse create(@Valid @RequestBody PropertyRequest request) {
        return propertyService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public PropertyResponse update(@PathVariable Long id, @Valid @RequestBody PropertyRequest request) {
        return propertyService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public PropertyResponse updateStatus(@PathVariable Long id, @RequestParam PropertyStatus status) {
        return propertyService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        propertyService.delete(id);
    }
}
