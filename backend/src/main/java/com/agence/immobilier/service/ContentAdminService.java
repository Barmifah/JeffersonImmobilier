package com.agence.immobilier.service;

import com.agence.immobilier.dto.request.SeoMetadataRequest;
import com.agence.immobilier.dto.request.SocialLinkRequest;
import com.agence.immobilier.dto.request.WebsiteSettingRequest;
import com.agence.immobilier.dto.response.SeoMetadataResponse;
import com.agence.immobilier.dto.response.SocialLinkResponse;
import com.agence.immobilier.dto.response.WebsiteSettingResponse;
import com.agence.immobilier.entity.SeoMetadata;
import com.agence.immobilier.entity.SocialLink;
import com.agence.immobilier.entity.WebsiteSetting;
import com.agence.immobilier.repository.SeoMetadataRepository;
import com.agence.immobilier.repository.SocialLinkRepository;
import com.agence.immobilier.repository.WebsiteSettingRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@SuppressWarnings("null")
public class ContentAdminService {
    private final SeoMetadataRepository seoMetadataRepository;
    private final SocialLinkRepository socialLinkRepository;
    private final WebsiteSettingRepository websiteSettingRepository;

    public ContentAdminService(SeoMetadataRepository seoMetadataRepository, SocialLinkRepository socialLinkRepository,
                               WebsiteSettingRepository websiteSettingRepository) {
        this.seoMetadataRepository = seoMetadataRepository;
        this.socialLinkRepository = socialLinkRepository;
        this.websiteSettingRepository = websiteSettingRepository;
    }

    @Transactional(readOnly = true)
    public List<SeoMetadataResponse> findSeo() {
        return seoMetadataRepository.findAll().stream().map(item -> new SeoMetadataResponse(item.getPath(), item.getTitle(), item.getDescription(), item.getImageUrl())).toList();
    }

    @Transactional
    public SeoMetadataResponse saveSeo(SeoMetadataRequest request) {
        SeoMetadata item = seoMetadataRepository.findByPath(request.path()).orElseGet(SeoMetadata::new);
        item.setPath(request.path());
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setImageUrl(request.imageUrl());
        SeoMetadata saved = seoMetadataRepository.save(item);
        return new SeoMetadataResponse(saved.getPath(), saved.getTitle(), saved.getDescription(), saved.getImageUrl());
    }

    @Transactional(readOnly = true)
    public List<SocialLinkResponse> findSocialLinks() {
        return socialLinkRepository.findAll().stream().map(item -> new SocialLinkResponse(item.getNetwork(), item.getUrl())).toList();
    }

    @Transactional
    public SocialLinkResponse saveSocialLink(Long id, SocialLinkRequest request) {
        SocialLink item = id == null ? new SocialLink() : socialLinkRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lien social introuvable"));
        item.setNetwork(request.network());
        item.setUrl(request.url());
        item.setEnabled(request.enabled());
        SocialLink saved = socialLinkRepository.save(item);
        return new SocialLinkResponse(saved.getNetwork(), saved.getUrl());
    }

    @Transactional(readOnly = true)
    public List<WebsiteSettingResponse> findSettings() {
        return websiteSettingRepository.findAll().stream().map(item -> new WebsiteSettingResponse(item.getSettingKey(), item.getSettingValue())).toList();
    }

    @Transactional
    public WebsiteSettingResponse saveSetting(String key, WebsiteSettingRequest request) {
        WebsiteSetting item = websiteSettingRepository.findById(key).orElseGet(WebsiteSetting::new);
        item.setSettingKey(key);
        item.setSettingValue(request.value());
        WebsiteSetting saved = websiteSettingRepository.save(item);
        return new WebsiteSettingResponse(saved.getSettingKey(), saved.getSettingValue());
    }
}
