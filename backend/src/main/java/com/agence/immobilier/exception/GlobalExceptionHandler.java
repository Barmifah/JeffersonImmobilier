package com.agence.immobilier.exception;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice
@SuppressWarnings("null")
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(error -> error.getField(), error -> error.getDefaultMessage(), (first, second) -> first));
        return error(HttpStatus.BAD_REQUEST, "Données invalides", fields);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleStatus(ResponseStatusException exception) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        return error(status, exception.getReason(), Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Une erreur interne est survenue", Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException exception) {
        String constraint = findConstraint(exception);
        String message = switch (constraint) {
            case "properties_reference_key" -> "La référence de cette annonce existe déjà";
            case "properties_slug_key" -> "Le slug de cette annonce existe déjà";
            case "property_feature_links_pkey" -> "Une caractéristique est présente deux fois dans cette annonce";
            default -> "L'annonce ne peut pas être enregistrée : contrainte de base de données " + constraint;
        };
        return error(HttpStatus.CONFLICT, message, Map.of("constraint", constraint));
    }

    private String findConstraint(DataIntegrityViolationException exception) {
        Throwable current = exception;
        while (current != null) {
            try {
                Object constraintName = current.getClass().getMethod("getConstraintName").invoke(current);
                if (constraintName instanceof String name && !name.isBlank()) {
                    return name;
                }
            } catch (ReflectiveOperationException ignored) {
                // Continue with the next wrapped database exception.
            }
            current = current.getCause();
        }
        return "inconnue";
    }

    private ResponseEntity<ApiError> error(HttpStatus status, String message, Map<String, String> fields) {
        return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, fields));
    }
}
