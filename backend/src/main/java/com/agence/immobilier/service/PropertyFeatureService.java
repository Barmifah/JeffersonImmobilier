package com.agence.immobilier.service;

import com.agence.immobilier.dto.response.PropertyFeatureResponse;
import com.agence.immobilier.repository.PropertyFeatureRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PropertyFeatureService {
    private final PropertyFeatureRepository propertyFeatureRepository;

    public PropertyFeatureService(PropertyFeatureRepository propertyFeatureRepository) {
        this.propertyFeatureRepository = propertyFeatureRepository;
    }

    @Transactional(readOnly = true)
    public List<PropertyFeatureResponse> findAll() {
        return propertyFeatureRepository.findAll().stream()
                .map(feature -> new PropertyFeatureResponse(feature.getId(), feature.getName(), feature.getIcon()))
                .toList();
    }
}
