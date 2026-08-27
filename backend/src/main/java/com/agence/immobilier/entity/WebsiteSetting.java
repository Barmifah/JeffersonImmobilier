package com.agence.immobilier.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "website_settings")
@Getter
@Setter
@NoArgsConstructor
public class WebsiteSetting {
    @Id
    @Column(length = 80)
    private String settingKey;

    @Column(nullable = false, columnDefinition = "text")
    private String settingValue;
}
