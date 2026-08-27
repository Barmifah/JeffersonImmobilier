package com.agence.immobilier.service;

import com.agence.immobilier.dto.request.PropertyRequest;
import com.agence.immobilier.dto.response.PropertyResponse;
import com.agence.immobilier.dto.response.PageResponse;
import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.Property;
import com.agence.immobilier.entity.PropertyImage;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.entity.PropertyView;
import com.agence.immobilier.repository.PropertyRepository;
import com.agence.immobilier.repository.PropertyViewRepository;
import com.agence.immobilier.repository.PropertyFeatureRepository;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@Service
@SuppressWarnings("null")
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final PropertyViewRepository propertyViewRepository;
    private final PropertyFeatureRepository propertyFeatureRepository;

    public PropertyService(PropertyRepository propertyRepository, PropertyViewRepository propertyViewRepository,
                           PropertyFeatureRepository propertyFeatureRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyViewRepository = propertyViewRepository;
        this.propertyFeatureRepository = propertyFeatureRepository;
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findPublished(OperationType operationType) {
        List<Property> properties = operationType == null
                ? propertyRepository.findByOperationTypeAndStatus(OperationType.VENTE, PropertyStatus.AVAILABLE)
                : propertyRepository.findByOperationTypeAndStatus(operationType, PropertyStatus.AVAILABLE);
        return properties.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<PropertyResponse> searchPublished(OperationType operationType, com.agence.immobilier.entity.PropertyType propertyType,
                                                          String location, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice,
                                                          Integer bedrooms, java.math.BigDecimal minArea, PropertyStatus status,
                                                          Pageable pageable) {
        Specification<Property> specification = (root, query, builder) -> builder.conjunction();
        if (operationType != null) specification = specification.and((root, query, builder) -> builder.equal(root.get("operationType"), operationType));
        if (propertyType != null) specification = specification.and((root, query, builder) -> builder.equal(root.get("propertyType"), propertyType));
        if (location != null && !location.isBlank()) {
            String pattern = "%" + location.trim().toLowerCase() + "%";
            specification = specification.and((root, query, builder) -> builder.or(
                    builder.like(builder.lower(root.get("city")), pattern),
                    builder.like(builder.lower(root.get("district")), pattern)));
        }
        if (minPrice != null) specification = specification.and((root, query, builder) -> builder.greaterThanOrEqualTo(root.get("price"), minPrice));
        if (maxPrice != null) specification = specification.and((root, query, builder) -> builder.lessThanOrEqualTo(root.get("price"), maxPrice));
        if (bedrooms != null) specification = specification.and((root, query, builder) -> builder.greaterThanOrEqualTo(root.get("bedrooms"), bedrooms));
        if (minArea != null) specification = specification.and((root, query, builder) -> builder.greaterThanOrEqualTo(root.get("area"), minArea));
        specification = specification.and((root, query, builder) -> builder.equal(root.get("status"), status == null ? PropertyStatus.AVAILABLE : status));
        Page<PropertyResponse> result = propertyRepository.findAll(specification, pageable).map(this::toResponse);
        return new PageResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(),
                result.getTotalPages(), result.isFirst(), result.isLast());
    }

    @Transactional
    public PropertyResponse findPublishedBySlug(String slug) {
        Property property = propertyRepository.findBySlug(slug)
                .filter(item -> item.getStatus() == PropertyStatus.AVAILABLE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bien introuvable"));
        PropertyView view = new PropertyView();
        view.setProperty(property);
        propertyViewRepository.save(view);
        return toResponse(property);
    }

    @Transactional
    public PropertyResponse create(PropertyRequest request) {
        var existing = propertyRepository.findByReference(request.reference());
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }
        Property property = new Property();
        copyRequest(request, property);
        return toResponse(propertyRepository.save(property));
    }

    @Transactional
    public PropertyResponse update(Long id, PropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bien introuvable"));
        propertyRepository.findByReference(request.reference())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Référence déjà utilisée"); });
        copyRequest(request, property);
        return toResponse(property);
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findAllForAdmin() {
        return propertyRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public PropertyResponse updateStatus(Long id, PropertyStatus status) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bien introuvable"));
        property.setStatus(status);
        return toResponse(property);
    }

    @Transactional
    public void delete(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bien introuvable");
        }
        propertyRepository.deleteById(id);
    }

    private void copyRequest(PropertyRequest request, Property property) {
        property.setReference(request.reference());
        property.setTitle(request.title());
        property.setTitleFr(request.titleFr() == null || request.titleFr().isBlank() ? request.title() : request.titleFr());
        property.setTitleEn(request.titleEn());
        property.setSlug(request.slug());
        property.setDescription(request.description());
        property.setDescriptionFr(request.descriptionFr() == null || request.descriptionFr().isBlank() ? request.description() : request.descriptionFr());
        property.setDescriptionEn(request.descriptionEn());
        property.setPropertyType(request.propertyType());
        property.setOperationType(request.operationType());
        property.setPrice(request.price());
        property.setCurrency(request.currency() == null || request.currency().isBlank() ? "XOF" : request.currency());
        property.setCity(request.city());
        property.setDistrict(request.district());
        property.setAddress(request.address());
        property.setLatitude(request.latitude());
        property.setLongitude(request.longitude());
        property.setArea(request.area());
        property.setBedrooms(request.bedrooms());
        property.setBathrooms(request.bathrooms());
        property.setLivingRooms(request.livingRooms());
        property.setParking(Boolean.TRUE.equals(request.parking()));
        property.getFeatures().clear();
        if (request.featureIds() != null && !request.featureIds().isEmpty()) {
            property.getFeatures().addAll(propertyFeatureRepository.findAllById(request.featureIds()));
        }
        property.getImages().clear();
        if (request.imageUrls() != null) {
            IntStream.range(0, request.imageUrls().size()).forEach(index -> {
                PropertyImage image = new PropertyImage();
                image.setProperty(property);
                image.setSecureUrl(request.imageUrls().get(index));
                image.setDisplayOrder(index);
                image.setCover(index == 0);
                image.setAltText(property.getTitle());
                property.getImages().add(image);
            });
        }
    }

    private PropertyResponse toResponse(Property property) {
        return new PropertyResponse(property.getId(), property.getReference(), property.getTitle(), property.getTitleFr(), property.getTitleEn(), property.getSlug(),
            property.getDescription(), property.getDescriptionFr(), property.getDescriptionEn(), property.getPropertyType(), property.getOperationType(), property.getPrice(),
                property.getCurrency(), property.getCity(), property.getDistrict(), property.getAddress(), property.getArea(),
                property.getBedrooms(), property.getBathrooms(), property.getLivingRooms(), property.getParking(),
                property.getStatus(), property.getCreatedAt(), property.getUpdatedAt(),
                property.getImages().stream().map(PropertyImage::getSecureUrl).toList(),
                property.getFeatures().stream().map(feature -> feature.getName()).toList(),
                property.getFeatures().stream().map(feature -> feature.getId()).toList());
    }
}
