package com.agence.immobilier.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class PropertyTypeConstraintMigration {
    public static final List<String> ALLOWED_PROPERTY_TYPES = List.of(
            "VILLA",
            "MAISON",
            "APPARTEMENT",
            "DUPLEX",
            "TRIPLEX",
            "TERRAIN",
            "BUREAU",
            "ENTREPOT",
            "BOUTIQUE",
            "PARCELLE",
            "LOCAL_COMMERCIAL",
            "IMMEUBLE",
            "AUTRE"
    );

    @Bean
    CommandLineRunner ensurePropertyTypeConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            Boolean tableExists = jdbcTemplate.queryForObject(
                    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties')",
                    Boolean.class
            );

            if (Boolean.TRUE.equals(tableExists)) {
                String sql = """
                        ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check;
                        ALTER TABLE properties
                        ADD CONSTRAINT properties_property_type_check
                        CHECK ((property_type)::text = ANY ((ARRAY['VILLA'::character varying, 'MAISON'::character varying, 'APPARTEMENT'::character varying, 'DUPLEX'::character varying, 'TRIPLEX'::character varying, 'TERRAIN'::character varying, 'BUREAU'::character varying, 'ENTREPOT'::character varying, 'BOUTIQUE'::character varying, 'PARCELLE'::character varying, 'LOCAL_COMMERCIAL'::character varying, 'IMMEUBLE'::character varying, 'AUTRE'::character varying])::text[]));
                        """;
                jdbcTemplate.execute(sql);
            }
        };
    }
}
