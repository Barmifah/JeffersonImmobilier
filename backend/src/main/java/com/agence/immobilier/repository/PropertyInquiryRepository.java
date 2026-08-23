package com.agence.immobilier.repository;

import com.agence.immobilier.entity.PropertyInquiry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {
}
