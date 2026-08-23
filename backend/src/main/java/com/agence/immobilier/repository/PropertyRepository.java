package com.agence.immobilier.repository;

import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.Property;
import com.agence.immobilier.entity.PropertyStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    Optional<Property> findBySlug(String slug);

    List<Property> findByOperationTypeAndStatus(OperationType operationType, PropertyStatus status);
}