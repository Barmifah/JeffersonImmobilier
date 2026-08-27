package com.agence.immobilier.repository;

import com.agence.immobilier.entity.City;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CityRepository extends JpaRepository<City, Long> {
    Optional<City> findBySlug(String slug);
}
