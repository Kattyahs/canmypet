package com.canmypet.foodservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "emergency_guides", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"risk_level"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String steps;

    @Column(name = "emergency_contacts_info", columnDefinition = "TEXT")
    private String emergencyContactsInfo;
}