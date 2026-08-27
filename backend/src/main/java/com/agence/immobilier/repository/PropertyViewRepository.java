package com.agence.immobilier.repository;

import com.agence.immobilier.entity.PropertyView;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyViewRepository extends JpaRepository<PropertyView, Long> {
    long countByPropertyId(Long propertyId);
}
