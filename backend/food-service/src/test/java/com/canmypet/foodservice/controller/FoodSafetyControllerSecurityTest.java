package com.canmypet.foodservice.controller;

import com.canmypet.foodservice.client.UserServiceClient;
import com.canmypet.foodservice.config.SecurityConfig;
import com.canmypet.foodservice.dto.FoodSafetyResponse;
import com.canmypet.foodservice.security.JwtPrincipal;
import com.canmypet.foodservice.security.JwtService;
import com.canmypet.foodservice.service.FoodSafetyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FoodSafetyController.class)
@Import(SecurityConfig.class)
class FoodSafetyControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FoodSafetyService foodSafetyService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserServiceClient userServiceClient;

    @Test
    void verify_asAdmin_isForbiddenBeforeReachingService() throws Exception {
        mockMvc.perform(put("/api/food-safety/7/verify").with(userWithRole("ADMIN")))
                .andExpect(status().isForbidden());

        verifyNoInteractions(foodSafetyService);
    }

    @Test
    void verify_asVeterinarian_reachesService() throws Exception {
        when(foodSafetyService.verifyFoodSafety(7L, 3L)).thenReturn(FoodSafetyResponse.builder().id(7L).build());

        mockMvc.perform(put("/api/food-safety/7/verify").with(userWithRole("VETERINARIAN")))
                .andExpect(status().isOk());

        verify(foodSafetyService).verifyFoodSafety(7L, 3L);
    }

    @Test
    void verify_withoutToken_isForbidden() throws Exception {
        mockMvc.perform(put("/api/food-safety/7/verify"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(foodSafetyService);
    }

    private RequestPostProcessor userWithRole(String role) {
        JwtPrincipal principal = new JwtPrincipal(3L, "user@example.com", role);
        return authentication(new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}