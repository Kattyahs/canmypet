package com.canmypet.userservice.config;

import com.canmypet.userservice.model.Role;
import com.canmypet.userservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@Profile("dev")
public class DemoVeterinarianSeeder implements CommandLineRunner {

    static final long DEMO_VETERINARIAN_ID = 9002L;
    static final String DEMO_VETERINARIAN_EMAIL = "vet@demo.canmypet";
    static final String DEMO_VETERINARIAN_NAME = "Demo Veterinarian";
    static final String DEMO_LICENSE_NUMBER = "DEMO-0001";

    private static final Logger log = LoggerFactory.getLogger(DemoVeterinarianSeeder.class);

    private static final String INSERT_SQL = "INSERT INTO users "
            + "(id, name, email, password, role, license_number, verified, created_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final String demoPassword;

    public DemoVeterinarianSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            @Value("${app.demo.password:}") String demoPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsById(DEMO_VETERINARIAN_ID)) {
            return;
        }

        if (userRepository.existsByEmail(DEMO_VETERINARIAN_EMAIL)) {
            log.warn("Email {} is already used by another account. The demo veterinarian was not created.",
                    DEMO_VETERINARIAN_EMAIL);
            return;
        }

        boolean canLogIn = !demoPassword.isBlank();
        String rawPassword = canLogIn ? demoPassword : UUID.randomUUID().toString();

        jdbcTemplate.update(INSERT_SQL,
                DEMO_VETERINARIAN_ID,
                DEMO_VETERINARIAN_NAME,
                DEMO_VETERINARIAN_EMAIL,
                passwordEncoder.encode(rawPassword),
                Role.VETERINARIAN.name(),
                DEMO_LICENSE_NUMBER,
                true,
                Timestamp.valueOf(LocalDateTime.now()));

        if (canLogIn) {
            log.info("Demo veterinarian created with id {} and email {}", DEMO_VETERINARIAN_ID, DEMO_VETERINARIAN_EMAIL);
        } else {
            log.info("Demo veterinarian created with id {} without a usable password (DEMO_PASSWORD is not set)",
                    DEMO_VETERINARIAN_ID);
        }
    }
}
