package com.agence.immobilier.repository;

import com.agence.immobilier.entity.PropertyInquiry;
import com.agence.immobilier.entity.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {
	long countByStatus(InquiryStatus status);

	java.util.List<PropertyInquiry> findAllByOrderByCreatedAtDesc();
}
