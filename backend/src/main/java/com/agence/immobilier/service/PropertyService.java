package com.agence.immobilier.service;

import com.agence.immobilier.dto.request.PropertyRequest;
import com.agence.immobilier.dto.response.PropertyResponse;
import com.agence.immobilier.entity.OperationType;
import com.agence.immobilier.entity.Property;
import com.agence.immobilier.entity.PropertyImage;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.repository.PropertyRepository;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PropertyService {
    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findPublished(OperationType operationType) {
        List<Property> properties = operationType == null
                ? propertyRepository.findByOperationTypeAndStatus(OperationType.VENTE, PropertyStatus.AVAILABLE)
                : propertyRepository.findByOperationTypeAndStatus(operationType, PropertyStatus.AVAILABLE);
        return properties.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PropertyResponse findPublishedBySlug(String slug) {
        Property property = propertyRepository.findBySlug(slug)
                .filter(item -> item.getStatus() == PropertyStatus.AVAILABLE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bien introuvable"));
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
        property.setSlug(request.slug());
        property.setDescription(request.description());
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
        return new PropertyResponse(property.getId(), property.getReference(), property.getTitle(), property.getSlug(),
                property.getDescription(), property.getPropertyType(), property.getOperationType(), property.getPrice(),
                property.getCurrency(), property.getCity(), property.getDistrict(), property.getAddress(), property.getArea(),
                property.getBedrooms(), property.getBathrooms(), property.getLivingRooms(), property.getParking(),
                property.getStatus(), property.getCreatedAt(), property.getUpdatedAt(),
                property.getImages().stream().map(PropertyImage::getSecureUrl).toList());
    }
}
