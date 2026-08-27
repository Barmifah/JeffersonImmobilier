package com.agence.immobilier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.agence.immobilier.dto.request.ContactMessageRequest;
import com.agence.immobilier.entity.ContactMessage;
import com.agence.immobilier.repository.ContactMessageRepository;
import com.agence.immobilier.service.ContactMessageService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class ContactMessageServiceTest {
    @Test
    @SuppressWarnings("all")
    void createPersistsAndReturnsContactMessage() {
        ContactMessageRepository repository = Mockito.mock(ContactMessageRepository.class);
        when(repository.save(any(ContactMessage.class))).thenAnswer(invocation -> {
            ContactMessage message = invocation.getArgument(0);
            message.setId(7L);
            return message;
        });
        ContactMessageService service = new ContactMessageService(repository);

        var response = service.create(new ContactMessageRequest("Awa Traore", "awa@example.com", "+22670000000", "Acheter", "Je cherche une villa."));

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getFullName()).isEqualTo("Awa Traore");
        assertThat(captor.getValue().getProject()).isEqualTo("Acheter");
        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.status()).isEqualTo("NEW");
    }

    @Test
    void rejectsUnknownStatus() {
        ContactMessageRepository repository = Mockito.mock(ContactMessageRepository.class);
        ContactMessageService service = new ContactMessageService(repository);

        assertThatThrownBy(() -> service.updateStatus(1L, "INVALID"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }
}
