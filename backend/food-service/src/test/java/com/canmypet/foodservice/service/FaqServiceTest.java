package com.canmypet.foodservice.service;

import com.canmypet.foodservice.client.UserServiceClient;
import com.canmypet.foodservice.dto.FaqAnswerRequest;
import com.canmypet.foodservice.dto.FaqRequest;
import com.canmypet.foodservice.dto.FaqResponse;
import com.canmypet.foodservice.dto.UserDto;
import com.canmypet.foodservice.exception.FaqNotFoundException;
import com.canmypet.foodservice.exception.UnauthorizedAnswerException;
import com.canmypet.foodservice.model.Faq;
import com.canmypet.foodservice.model.FaqStatus;
import com.canmypet.foodservice.repository.FaqRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.canmypet.foodservice.dto.PageResponse;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FaqServiceTest {

    @Mock
    private FaqRepository faqRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private FaqService faqService;

    @Test
    void getFaqs_withoutStatus_returnsEveryQuestion() {
        Faq faq = Faq.builder().id(1L).question("Puedo darle uvas?").askedBy(1L).status(FaqStatus.PENDING).build();

        Pageable pageable = PageRequest.of(0, 20);
        when(faqRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(faq), pageable, 1));

        PageResponse<FaqResponse> result = faqService.getFaqs(null, pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).getQuestion()).isEqualTo("Puedo darle uvas?");
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void getFaqs_withPendingStatus_filtersByStatus() {
        Faq pending = Faq.builder().id(2L).question("Puedo darle cebolla?").askedBy(1L).status(FaqStatus.PENDING).build();

        Pageable pageable = PageRequest.of(0, 20);
        when(faqRepository.findByStatus(FaqStatus.PENDING, pageable))
                .thenReturn(new PageImpl<>(List.of(pending), pageable, 1));

        PageResponse<FaqResponse> result = faqService.getFaqs(FaqStatus.PENDING, pageable);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).getStatus()).isEqualTo(FaqStatus.PENDING);
        // The filter runs in the database, not after loading everything
        verify(faqRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void askQuestion_createsQuestionWithPendingStatus() {
        FaqRequest request = new FaqRequest();
        request.setQuestion("¿Puedo darle uvas?");

        Faq saved = Faq.builder()
                .id(1L)
                .question("¿Puedo darle uvas?")
                .askedBy(1L)
                .status(FaqStatus.PENDING)
                .build();

        when(faqRepository.save(any(Faq.class))).thenReturn(saved);

        FaqResponse response = faqService.askQuestion(request, 1L);

        assertThat(response.getStatus()).isEqualTo(FaqStatus.PENDING);
        assertThat(response.getAskedBy()).isEqualTo(1L);
    }

    @Test
    void answerQuestion_withVerifiedVeterinarian_answersSuccessfully() {
        Long faqId = 1L;
        Long vetId = 5L;

        Faq faq = Faq.builder()
                .id(faqId)
                .question("¿Puedo darle uvas?")
                .askedBy(1L)
                .status(FaqStatus.PENDING)
                .build();

        FaqAnswerRequest request = new FaqAnswerRequest();
        request.setAnswer("No, son tóxicas.");

        UserDto vet = new UserDto();
        vet.setRole("VETERINARIAN");
        vet.setVerified(true);

        when(faqRepository.findById(faqId)).thenReturn(Optional.of(faq));
        when(userServiceClient.getUserById(vetId)).thenReturn(vet);
        when(faqRepository.save(any(Faq.class))).thenReturn(faq);

        FaqResponse response = faqService.answerQuestion(faqId, request, vetId);

        assertThat(response.getStatus()).isEqualTo(FaqStatus.ANSWERED);
        assertThat(response.getAnsweredBy()).isEqualTo(vetId);
    }

    @Test
    void answerQuestion_withUnverifiedVeterinarian_throwsUnauthorizedAnswerException() {
        Long faqId = 1L;
        Long unverifiedVetId = 6L;

        Faq faq = Faq.builder().id(faqId).question("¿Puedo darle uvas?").askedBy(1L).build();

        FaqAnswerRequest request = new FaqAnswerRequest();
        request.setAnswer("No, son tóxicas.");

        UserDto unverifiedVet = new UserDto();
        unverifiedVet.setRole("VETERINARIAN");
        unverifiedVet.setVerified(false);

        when(faqRepository.findById(faqId)).thenReturn(Optional.of(faq));
        when(userServiceClient.getUserById(unverifiedVetId)).thenReturn(unverifiedVet);

        assertThatThrownBy(() -> faqService.answerQuestion(faqId, request, unverifiedVetId))
                .isInstanceOf(UnauthorizedAnswerException.class);

        verify(faqRepository, never()).save(any(Faq.class));
    }

    @Test
    void answerQuestion_nonExistentFaq_throwsFaqNotFoundException() {
        Long faqId = 999L;
        FaqAnswerRequest request = new FaqAnswerRequest();
        request.setAnswer("Respuesta");

        when(faqRepository.findById(faqId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> faqService.answerQuestion(faqId, request, 5L))
                .isInstanceOf(FaqNotFoundException.class);
    }
}