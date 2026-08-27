package com.agence.immobilier.controller;

import com.agence.immobilier.entity.PropertyStatus;
import com.agence.immobilier.repository.PropertyRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SeoController {
    private final PropertyRepository propertyRepository;
    private final String siteUrl;

    public SeoController(PropertyRepository propertyRepository,
                         @Value("${seo.site-url:https://jefferson-immobilier.example}") String siteUrl) {
        this.propertyRepository = propertyRepository;
        this.siteUrl = siteUrl.replaceAll("/$", "");
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        List<String> paths = List.of("/", "/acheter", "/louer", "/terrains", "/maisons", "/appartements",
                "/a-propos", "/services", "/contact", "/faq", "/immobilier-burkina-faso",
                "/immobilier-ouagadougou", "/immobilier-bobo-dioulasso", "/maison-a-vendre-ouagadougou",
            "/maison-a-louer-ouagadougou", "/terrain-a-vendre-ouagadougou",
            "/ville/ouagadougou", "/ville/bobo-dioulasso", "/quartier/ouaga-2000", "/quartier/zone-du-bois",
            "/fr/acheter", "/fr/louer", "/fr/terrains", "/fr/maisons", "/fr/appartements",
            "/en/buy", "/en/rent", "/en/land", "/en/houses", "/en/apartments");
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")
                .append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
        paths.forEach(path -> appendUrl(xml, siteUrl + path));
        propertyRepository.findByStatusOrderByUpdatedAtDesc(PropertyStatus.AVAILABLE)
                .forEach(property -> appendUrl(xml, siteUrl + "/biens/" + escape(property.getSlug())));
        return xml.append("</urlset>").toString();
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String robots() {
        return "User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: " + siteUrl + "/sitemap.xml\n";
    }

    private void appendUrl(StringBuilder xml, String url) {
        xml.append("<url><loc>").append(url).append("</loc></url>");
    }

    private String escape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}
