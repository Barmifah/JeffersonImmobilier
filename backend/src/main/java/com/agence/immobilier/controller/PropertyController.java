package com.agence.immobilier.controller;

import com.agence.immobilier.dto.request.PropertyRequest;
import com.agence.immobilier.dto.response.PropertyResponse;
import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.service.PropertyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/{slug}")
    public PropertyResponse findPublishedBySlug(@PathVariable String slug) {
        return propertyService.findPublishedBySlug(slug);
    }

    @GetMapping("/admin/all")
    public List<PropertyResponse> findAllForAdmin() {
        return propertyService.findAllForAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertyResponse create(@Valid @RequestBody PropertyRequest request) {
        return propertyService.create(request);
    }

    @PatchMapping("/{id}/status")
    public PropertyResponse updateStatus(@PathVariable Long id, @RequestParam PropertyStatus status) {
        return propertyService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        propertyService.delete(id);
    }
}
