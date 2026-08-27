package com.agence.immobilier.repository;

import com.agence.immobilier.entity.WebsiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebsiteSettingRepository extends JpaRepository<WebsiteSetting, String> {
}
