package com.agence.immobilier.dto.response;

import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.entity.PropertyType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record PropertyResponse(
        Long id,
        String reference,
        String title,
        String titleFr,
        String titleEn,
        String slug,
        String description,
        String descriptionFr,
        String descriptionEn,
        PropertyType propertyType,
        OperationType operationType,
        BigDecimal price,
        String currency,
        String city,
        String district,
        String address,
        BigDecimal area,
        Integer bedrooms,
        Integer bathrooms,
        Integer livingRooms,
        Boolean parking,
        PropertyStatus status,
        Instant createdAt,
        Instant updatedAt,
        List<String> imageUrls,
        List<String> features,
        List<Long> featureIds
) {
}
