package com.agence.immobilier.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageStorageService {
    private final Cloudinary cloudinary;
    private final String cloudName;

    public ImageStorageService(Cloudinary cloudinary, @Value("${cloudinary.cloud-name}") String cloudName) {
        this.cloudinary = cloudinary;
        this.cloudName = cloudName;
    }

    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier image est vide");
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier doit être une image");
        }
        if (cloudName.isBlank()) {
            throw new IllegalStateException("Cloudinary n'est pas configuré");
        }
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "jefferson-immobilier/properties",
                    "resource_type", "image"));
            return (String) result.get("secure_url");
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible d'envoyer l'image", exception);
        }
    }
}
