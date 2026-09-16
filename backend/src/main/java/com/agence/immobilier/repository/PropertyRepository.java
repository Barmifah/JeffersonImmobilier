package com.agence.immobilier.repository;

import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.Property;
import com.agence.immobilier.entity.PropertyStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    Optional<Property> findByReference(String reference);

    Optional<Property> findBySlug(String slug);

    @Query(value = "SELECT setval(pg_get_serial_sequence('properties', 'id'), COALESCE((SELECT MAX(id) FROM properties), 1), true)", nativeQuery = true)
    Long synchronizeIdSequence();

    List<Property> findByOperationTypeAndStatusOrderByCreatedAtDesc(OperationType operationType, PropertyStatus status);

    List<Property> findByStatusOrderByUpdatedAtDesc(PropertyStatus status);
}