package com.agence.immobilier.dto.request;

import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.PropertyType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record PropertyRequest(
        @NotBlank String reference,
        @NotBlank String title,
        @NotBlank String slug,
        @NotBlank String description,
        @NotNull PropertyType propertyType,
        @NotNull OperationType operationType,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        String currency,
        @NotBlank String city,
        String district,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        @DecimalMin("0.0") BigDecimal area,
        Integer bedrooms,
        Integer bathrooms,
        Integer livingRooms,
        Boolean parking,
        List<@NotBlank String> imageUrls
) {
}
