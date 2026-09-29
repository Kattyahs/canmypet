package com.canmypet.userservice.config;

import com.canmypet.userservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Timestamp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoUserSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Test
    void run_whenNoDemoUsersExist_createsOwnerVerifiedVetAndPendingVet() {
        when(passwordEncoder.encode("secret123")).thenReturn("encoded");

        seeder("secret123").run();

        verify(jdbcTemplate).update(startsWith("INSERT INTO users"),
                eq(9001L), eq("Demo Owner"), eq("owner@demo.canmypet"), eq("encoded"),
                eq("OWNER"), isNull(), eq(true), any(Timestamp.class));
        verify(jdbcTemplate).update(startsWith("INSERT INTO users"),
                eq(9002L), eq("Demo Veterinarian"), eq("vet@demo.canmypet"), eq("encoded"),
                eq("VETERINARIAN"), eq("DEMO-0001"), eq(true), any(Timestamp.class));
        verify(jdbcTemplate).update(startsWith("INSERT INTO users"),
                eq(9003L), eq("Demo Pending Veterinarian"), eq("vet.pending@demo.canmypet"), eq("encoded"),
                eq("VETERINARIAN"), eq("DEMO-0002"), eq(false), any(Timestamp.class));
    }

    @Test
    void run_whenAllDemoUsersExist_doesNothing() {
        DemoUserSeeder.DEMO_ACCOUNTS.forEach(account ->
                when(userRepository.existsById(account.id())).thenReturn(true));

        seeder("secret123").run();

        verifyNoInteractions(jdbcTemplate, passwordEncoder);
    }

    @Test
    void run_whenOneDemoUserExists_createsOnlyTheMissingOnes() {
        when(userRepository.existsById(anyLong())).thenAnswer(invocation -> invocation.getArgument(0).equals(9002L));
        when(passwordEncoder.encode("secret123")).thenReturn("encoded");

        seeder("secret123").run();

        verify(passwordEncoder, times(2)).encode("secret123");
        verify(jdbcTemplate, never()).update(startsWith("INSERT INTO users"),
                eq(9002L), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void run_whenEmailIsTakenByAnotherAccount_skipsThatDemoUser() {
        when(userRepository.existsByEmail(anyString()))
                .thenAnswer(invocation -> "owner@demo.canmypet".equals(invocation.getArgument(0)));
        when(passwordEncoder.encode("secret123")).thenReturn("encoded");

        seeder("secret123").run();

        verify(jdbcTemplate, never()).update(startsWith("INSERT INTO users"),
                eq(9001L), any(), any(), any(), any(), any(), any(), any());
        verify(passwordEncoder, times(2)).encode("secret123");
    }

    @Test
    void run_withoutDemoPassword_usesARandomPasswordPerAccount() {
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        seeder("  ").run();

        ArgumentCaptor<String> rawPasswords = ArgumentCaptor.forClass(String.class);
        verify(passwordEncoder, times(3)).encode(rawPasswords.capture());
        assertThat(rawPasswords.getAllValues())
                .allSatisfy(password -> assertThat(password).hasSizeGreaterThanOrEqualTo(32))
                .doesNotHaveDuplicates();
    }

    private DemoUserSeeder seeder(String demoPassword) {
        return new DemoUserSeeder(userRepository, passwordEncoder, jdbcTemplate, demoPassword);
    }
}