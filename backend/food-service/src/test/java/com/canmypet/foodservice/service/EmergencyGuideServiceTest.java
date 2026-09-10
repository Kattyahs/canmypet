package com.canmypet.foodservice.service;

import com.canmypet.foodservice.dto.EmergencyGuideRequest;
import com.canmypet.foodservice.dto.EmergencyGuideResponse;
import com.canmypet.foodservice.exception.EmergencyGuideNotFoundException;
import com.canmypet.foodservice.model.EmergencyGuide;
import com.canmypet.foodservice.model.RiskLevel;
import com.canmypet.foodservice.repository.EmergencyGuideRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmergencyGuideServiceTest {

    @Mock
    private EmergencyGuideRepository emergencyGuideRepository;

    @InjectMocks
    private EmergencyGuideService emergencyGuideService;

    @Test
    void getByRiskLevel_existingLevel_returnsGuide() {
        EmergencyGuide guide = EmergencyGuide.builder()
                .id(1L)
                .riskLevel(RiskLevel.LETHAL)
                .steps("Llama a tu veterinario inmediatamente.")
                .build();

        when(emergencyGuideRepository.findByRiskLevel(RiskLevel.LETHAL)).thenReturn(Optional.of(guide));

        EmergencyGuideResponse response = emergencyGuideService.getByRiskLevel(RiskLevel.LETHAL);

        assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.LETHAL);
    }

    @Test
    void getByRiskLevel_nonExistentLevel_throwsEmergencyGuideNotFoundException() {
        when(emergencyGuideRepository.findByRiskLevel(RiskLevel.SAFE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> emergencyGuideService.getByRiskLevel(RiskLevel.SAFE))
                .isInstanceOf(EmergencyGuideNotFoundException.class);
    }

    @Test
    void createOrUpdate_newLevel_createsGuide() {
        EmergencyGuideRequest request = new EmergencyGuideRequest();
        request.setRiskLevel(RiskLevel.TOXIC);
        request.setSteps("Contacta a tu veterinario.");

        when(emergencyGuideRepository.findByRiskLevel(RiskLevel.TOXIC)).thenReturn(Optional.empty());

        EmergencyGuide saved = EmergencyGuide.builder()
                .id(1L)
                .riskLevel(RiskLevel.TOXIC)
                .steps("Contacta a tu veterinario.")
                .build();

        when(emergencyGuideRepository.save(any(EmergencyGuide.class))).thenReturn(saved);

        EmergencyGuideResponse response = emergencyGuideService.createOrUpdate(request);

        assertThat(response.getRiskLevel()).isEqualTo(RiskLevel.TOXIC);
    }

    @Test
    void createOrUpdate_existingLevel_updatesGuide() {
        EmergencyGuide existing = EmergencyGuide.builder()
                .id(1L)
                .riskLevel(RiskLevel.TOXIC)
                .steps("Pasos viejos.")
                .build();

        EmergencyGuideRequest request = new EmergencyGuideRequest();
        request.setRiskLevel(RiskLevel.TOXIC);
        request.setSteps("Pasos actualizados.");

        when(emergencyGuideRepository.findByRiskLevel(RiskLevel.TOXIC)).thenReturn(Optional.of(existing));
        when(emergencyGuideRepository.save(any(EmergencyGuide.class))).thenReturn(existing);

        EmergencyGuideResponse response = emergencyGuideService.createOrUpdate(request);

        assertThat(response.getSteps()).isEqualTo("Pasos actualizados.");

        verify(emergencyGuideRepository, times(1)).save(any(EmergencyGuide.class));
    }
}