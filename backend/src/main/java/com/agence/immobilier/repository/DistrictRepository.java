package com.agence.immobilier.repository;

import com.agence.immobilier.entity.District;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findByCitySlugOrderByName(String citySlug);
}
