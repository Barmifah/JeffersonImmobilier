package com.agence.immobilier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.agence.immobilier.controller.PropertyHtmlController;
import com.agence.immobilier.entity.Property;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.repository.PropertyRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class PropertyHtmlControllerTest {
    @Test
    void rendersIndexablePropertyHtml() {
        PropertyRepository repository = Mockito.mock(PropertyRepository.class);
        Property property = new Property();
        property.setSlug("villa-ouaga");
        property.setTitle("Villa & jardin");
        property.setDescription("Une villa disponible.");
        property.setCity("Ouagadougou");
        property.setPrice(BigDecimal.valueOf(185000000));
        property.setCurrency("XOF");
        property.setStatus(PropertyStatus.AVAILABLE);
        when(repository.findBySlug("villa-ouaga")).thenReturn(Optional.of(property));

        String html = new PropertyHtmlController(repository, "https://example.com").property("villa-ouaga");

        assertThat(html).contains("<h1>Villa &amp; jardin</h1>", "application/ld+json", "rel=\"canonical\"", "185000000");
    }
}
