package com.agence.immobilier.controller;

import com.agence.immobilier.dto.request.SeoMetadataRequest;
import com.agence.immobilier.dto.request.SocialLinkRequest;
import com.agence.immobilier.dto.request.WebsiteSettingRequest;
import com.agence.immobilier.dto.response.SeoMetadataResponse;
import com.agence.immobilier.dto.response.SocialLinkResponse;
import com.agence.immobilier.dto.response.WebsiteSettingResponse;
import com.agence.immobilier.service.ContentAdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/admin/content")
@PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
public class ContentAdminController {
    private final ContentAdminService contentAdminService;

    public ContentAdminController(ContentAdminService contentAdminService) {
        this.contentAdminService = contentAdminService;
    }

    @GetMapping("/seo")
    public List<SeoMetadataResponse> seo() { return contentAdminService.findSeo(); }

    @PutMapping("/seo")
    public SeoMetadataResponse saveSeo(@Valid @RequestBody SeoMetadataRequest request) { return contentAdminService.saveSeo(request); }

    @GetMapping("/social-links")
    public List<SocialLinkResponse> socialLinks() { return contentAdminService.findSocialLinks(); }

    @PostMapping("/social-links")
    @ResponseStatus(HttpStatus.CREATED)
    public SocialLinkResponse createSocialLink(@Valid @RequestBody SocialLinkRequest request) { return contentAdminService.saveSocialLink(null, request); }

    @PutMapping("/social-links/{id}")
    public SocialLinkResponse updateSocialLink(@PathVariable Long id, @Valid @RequestBody SocialLinkRequest request) { return contentAdminService.saveSocialLink(id, request); }

    @GetMapping("/settings")
    public List<WebsiteSettingResponse> settings() { return contentAdminService.findSettings(); }

    @PutMapping("/settings/{key}")
    public WebsiteSettingResponse saveSetting(@PathVariable String key, @Valid @RequestBody WebsiteSettingRequest request) { return contentAdminService.saveSetting(key, request); }
}
