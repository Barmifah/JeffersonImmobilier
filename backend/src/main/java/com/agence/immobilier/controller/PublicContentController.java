package com.agence.immobilier.controller;

import com.agence.immobilier.dto.response.SeoMetadataResponse;
import com.agence.immobilier.dto.response.SocialLinkResponse;
import com.agence.immobilier.dto.response.WebsiteSettingResponse;
import com.agence.immobilier.dto.response.PropertyFeatureResponse;
import com.agence.immobilier.repository.SeoMetadataRepository;
import com.agence.immobilier.repository.SocialLinkRepository;
import com.agence.immobilier.repository.WebsiteSettingRepository;
import com.agence.immobilier.service.PropertyFeatureService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicContentController {
    private final SeoMetadataRepository seoMetadataRepository;
    private final SocialLinkRepository socialLinkRepository;
    private final WebsiteSettingRepository websiteSettingRepository;
    private final PropertyFeatureService propertyFeatureService;

    public PublicContentController(SeoMetadataRepository seoMetadataRepository, SocialLinkRepository socialLinkRepository,
                                   WebsiteSettingRepository websiteSettingRepository, PropertyFeatureService propertyFeatureService) {
        this.seoMetadataRepository = seoMetadataRepository;
        this.socialLinkRepository = socialLinkRepository;
        this.websiteSettingRepository = websiteSettingRepository;
        this.propertyFeatureService = propertyFeatureService;
    }

    @GetMapping("/seo")
    public SeoMetadataResponse seo(@RequestParam String path) {
        return seoMetadataRepository.findByPath(path)
                .map(metadata -> new SeoMetadataResponse(metadata.getPath(), metadata.getTitle(), metadata.getDescription(), metadata.getImageUrl()))
                .orElse(null);
    }

    @GetMapping("/social-links")
    public List<SocialLinkResponse> socialLinks() {
        return socialLinkRepository.findByEnabledTrueOrderByNetwork().stream()
                .map(link -> new SocialLinkResponse(link.getNetwork(), link.getUrl()))
                .toList();
    }

    @GetMapping("/settings")
    public List<WebsiteSettingResponse> settings() {
        return websiteSettingRepository.findAll().stream()
                .filter(setting -> setting.getSettingKey().equals("whatsapp.number"))
                .map(setting -> new WebsiteSettingResponse(setting.getSettingKey(), setting.getSettingValue()))
                .toList();
    }

    @GetMapping("/features")
    public List<PropertyFeatureResponse> features() {
        return propertyFeatureService.findAll();
    }
}
