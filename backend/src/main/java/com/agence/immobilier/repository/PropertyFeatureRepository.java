package com.agence.immobilier.repository;

import com.agence.immobilier.entity.PropertyFeature;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyFeatureRepository extends JpaRepository<PropertyFeature, Long> {
}
