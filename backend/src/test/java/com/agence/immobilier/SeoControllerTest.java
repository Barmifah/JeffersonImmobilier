package com.agence.immobilier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.agence.immobilier.controller.SeoController;
import com.agence.immobilier.entity.Property;
import com.agence.immobilier.repository.PropertyRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class SeoControllerTest {
    @Test
    void sitemapContainsPublicPagesAndAvailableProperties() {
        PropertyRepository repository = Mockito.mock(PropertyRepository.class);
        Property property = new Property();
        property.setSlug("villa-ouaga");
        when(repository.findByStatusOrderByUpdatedAtDesc(com.agence.immobilier.entity.PropertyStatus.AVAILABLE))
                .thenReturn(List.of(property));

        SeoController controller = new SeoController(repository, "https://example.com");

        assertThat(controller.sitemap()).contains("https://example.com/acheter", "https://example.com/ville/ouagadougou",
            "https://example.com/quartier/ouaga-2000", "https://example.com/biens/villa-ouaga");
    }

    @Test
    void robotsPointsToSitemapAndBlocksAdmin() {
        SeoController controller = new SeoController(Mockito.mock(PropertyRepository.class), "https://example.com");

        assertThat(controller.robots()).contains("Disallow: /admin", "Sitemap: https://example.com/sitemap.xml");
    }
}
