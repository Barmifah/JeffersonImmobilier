package com.agence.immobilier.repository;

import com.agence.immobilier.entity.SocialLink;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
    List<SocialLink> findByEnabledTrueOrderByNetwork();
}
