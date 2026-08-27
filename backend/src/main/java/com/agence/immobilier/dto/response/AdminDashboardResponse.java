package com.agence.immobilier.dto.response;

import java.util.List;

public record AdminDashboardResponse(long publishedProperties, long availableProperties,
                                    long totalInquiries, long newInquiries, long totalViews,
                                    List<PropertyResponse> properties, List<InquiryResponse> inquiries) {
}