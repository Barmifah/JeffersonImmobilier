package com.agence.immobilier;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.agence.immobilier.controller.ContactMessageController;
import com.agence.immobilier.service.ContactMessageService;
import com.agence.immobilier.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ContactMessageController.class)
@AutoConfigureMockMvc(addFilters = false)
class ContactMessageControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContactMessageService contactMessageService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @SuppressWarnings("all")
    void contactMessageCanBeSubmittedWithoutAuthentication() throws Exception {
        when(contactMessageService.create(any())).thenReturn(null);

        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"fullName\":\"Awa Traore\",\"email\":\"awa@example.com\",\"message\":\"Bonjour\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    @SuppressWarnings("all")
    void invalidContactMessageIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"fullName\":\"\",\"email\":\"invalid\",\"message\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
