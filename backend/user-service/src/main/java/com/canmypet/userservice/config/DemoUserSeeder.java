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
import java.util.List;
import java.util.UUID;

@Component
@Profile("dev")
public class DemoUserSeeder implements CommandLineRunner {

    record DemoAccount(long id, String name, String email, Role role, String licenseNumber, boolean verified) {
    }

    static final DemoAccount DEMO_OWNER = new DemoAccount(
            9001L, "Demo Owner", "owner@demo.canmypet", Role.OWNER, null, true);
    static final DemoAccount DEMO_VETERINARIAN = new DemoAccount(
            9002L, "Demo Veterinarian", "vet@demo.canmypet", Role.VETERINARIAN, "DEMO-0001", true);
    static final DemoAccount DEMO_PENDING_VETERINARIAN = new DemoAccount(
            9003L, "Demo Pending Veterinarian", "vet.pending@demo.canmypet", Role.VETERINARIAN, "DEMO-0002", false);

    static final List<DemoAccount> DEMO_ACCOUNTS = List.of(DEMO_OWNER, DEMO_VETERINARIAN, DEMO_PENDING_VETERINARIAN);

    private static final Logger log = LoggerFactory.getLogger(DemoUserSeeder.class);

    private static final String INSERT_SQL = "INSERT INTO users "
            + "(id, name, email, password, role, license_number, verified, created_at) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final String demoPassword;

    public DemoUserSeeder(
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
        boolean canLogIn = !demoPassword.isBlank();
        int created = 0;

        for (DemoAccount account : DEMO_ACCOUNTS) {
            if (createIfMissing(account, canLogIn)) {
                created++;
            }
        }

        if (created == 0) {
            return;
        }
        if (canLogIn) {
            log.info("Demo users: {} accounts created, all with the password from DEMO_PASSWORD", created);
        } else {
            log.info("Demo users: {} accounts created without a usable password (DEMO_PASSWORD is not set)", created);
        }
    }

    private boolean createIfMissing(DemoAccount account, boolean canLogIn) {
        if (userRepository.existsById(account.id())) {
            return false;
        }
        if (userRepository.existsByEmail(account.email())) {
            log.warn("Email {} is already used by another account. Demo user {} was not created.",
                    account.email(), account.id());
            return false;
        }

        String rawPassword = canLogIn ? demoPassword : UUID.randomUUID().toString();

        jdbcTemplate.update(INSERT_SQL,
                account.id(),
                account.name(),
                account.email(),
                passwordEncoder.encode(rawPassword),
                account.role().name(),
                account.licenseNumber(),
                account.verified(),
                Timestamp.valueOf(LocalDateTime.now()));

        log.info("Demo user created: id {}, {}, {}", account.id(), account.email(), account.role());
        return true;
    }
}