package com.agence.immobilier.controller;

import com.agence.immobilier.dto.response.AdminDashboardResponse;
import com.agence.immobilier.entity.InquiryStatus;
import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.service.InquiryService;
import com.agence.immobilier.service.PropertyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    private final PropertyService propertyService;
    private final InquiryService inquiryService;

    public AdminDashboardController(PropertyService propertyService, InquiryService inquiryService) {
        this.propertyService = propertyService;
        this.inquiryService = inquiryService;
    }

    @GetMapping
    public AdminDashboardResponse getDashboard() {
        var properties = propertyService.findAllForAdmin();
        var inquiries = inquiryService.findAllForAdmin();
        return new AdminDashboardResponse(
                properties.stream().filter(property -> property.status() != PropertyStatus.DRAFT
                        && property.status() != PropertyStatus.ARCHIVED).count(),
                properties.stream().filter(property -> property.status() == PropertyStatus.AVAILABLE).count(),
                inquiries.size(), inquiryService.countByStatus(InquiryStatus.NEW), properties, inquiries);
    }
}