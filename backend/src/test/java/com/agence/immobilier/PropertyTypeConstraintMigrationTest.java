package com.agence.immobilier;

import static org.assertj.core.api.Assertions.assertThat;

import com.agence.immobilier.config.PropertyTypeConstraintMigration;
import org.junit.jupiter.api.Test;

class PropertyTypeConstraintMigrationTest {
    @Test
    void shouldIncludeTheAdditionalPropertyTypesAcceptedByDatabase() {
        assertThat(PropertyTypeConstraintMigration.ALLOWED_PROPERTY_TYPES)
                .contains("VILLA", "MAISON", "APPARTEMENT", "DUPLEX", "TRIPLEX", "TERRAIN", "BUREAU", "ENTREPOT", "BOUTIQUE", "PARCELLE", "LOCAL_COMMERCIAL", "IMMEUBLE", "AUTRE");
    }
}
