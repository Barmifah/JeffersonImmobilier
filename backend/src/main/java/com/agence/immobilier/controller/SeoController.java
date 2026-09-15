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
                         @Value("${seo.site-url:https://jeffersonimmobilier.bf}") String siteUrl) {
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
                "/en/buy", "/en/rent", "/en/land", "/en/houses", "/en/apartments",
                "/acheter?type=maison", "/louer?type=maison", "/acheter?type=appartement", "/louer?type=appartement",
                "/acheter?type=terrain", "/louer?type=terrain",
                "/acheter?type=duplex", "/louer?type=duplex", "/acheter?type=triplex", "/louer?type=triplex",
                "/acheter?type=immeuble", "/louer?type=immeuble", "/acheter?type=bureau", "/louer?type=bureau",
                "/acheter?type=entrepot", "/louer?type=entrepot", "/acheter?type=boutique", "/louer?type=boutique",
                "/acheter?type=parcelle", "/louer?type=parcelle",
                "/fr/acheter?type=duplex", "/fr/louer?type=duplex", "/fr/acheter?type=triplex", "/fr/louer?type=triplex",
                "/fr/acheter?type=immeuble", "/fr/louer?type=immeuble", "/fr/acheter?type=bureau", "/fr/louer?type=bureau",
                "/fr/acheter?type=entrepot", "/fr/louer?type=entrepot", "/fr/acheter?type=boutique", "/fr/louer?type=boutique",
                "/fr/acheter?type=parcelle", "/fr/louer?type=parcelle",
                "/fr/acheter?type=maison", "/fr/louer?type=maison", "/fr/acheter?type=appartement", "/fr/louer?type=appartement",
                "/fr/acheter?type=terrain", "/fr/louer?type=terrain",
                "/en/buy?type=duplex", "/en/rent?type=duplex", "/en/buy?type=triplex", "/en/rent?type=triplex",
                "/en/buy?type=immeuble", "/en/rent?type=immeuble", "/en/buy?type=bureau", "/en/rent?type=bureau",
                "/en/buy?type=entrepot", "/en/rent?type=entrepot", "/en/buy?type=boutique", "/en/rent?type=boutique",
                "/en/buy?type=parcelle", "/en/rent?type=parcelle",
                "/en/buy?type=maison", "/en/rent?type=maison", "/en/buy?type=appartement", "/en/rent?type=appartement",
                "/en/buy?type=terrain", "/en/rent?type=terrain");
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
