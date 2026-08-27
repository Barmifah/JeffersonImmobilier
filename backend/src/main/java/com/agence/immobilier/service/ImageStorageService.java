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
    private final String uploadPreset;

    public ImageStorageService(Cloudinary cloudinary,
                               @Value("${cloudinary.cloud-name}") String cloudName,
                               @Value("${cloudinary.upload-preset}") String uploadPreset) {
        this.cloudinary = cloudinary;
        this.cloudName = cloudName;
        this.uploadPreset = uploadPreset;
    }

    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier image est vide");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier doit être une image");
        }
        if (cloudName.isBlank()) {
            throw new IllegalStateException("Cloudinary n'est pas configuré");
        }
        if (uploadPreset.isBlank()) {
            throw new IllegalStateException("Le preset Cloudinary n'est pas configuré");
        }
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "jefferson-immobilier/properties",
                    "upload_preset", uploadPreset,
                    "resource_type", "image"));
            return (String) result.get("secure_url");
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible d'envoyer l'image", exception);
        }
    }
}
