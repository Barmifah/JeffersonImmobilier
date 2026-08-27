package com.agence.immobilier.repository;

import com.agence.immobilier.entity.SeoMetadata;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeoMetadataRepository extends JpaRepository<SeoMetadata, Long> {
    Optional<SeoMetadata> findByPath(String path);
}
