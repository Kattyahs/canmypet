package com.canmypet.foodservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "food_safety", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"food_id", "species", "life_stage"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodSafety {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Species species;

    @Enumerated(EnumType.STRING)
    @Column(name = "life_stage")
    private LifeStage lifeStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "verified_by")
    private Long verifiedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "verified_status", nullable = false)
    @Builder.Default
    private VerifiedStatus verifiedStatus = VerifiedStatus.PENDING;

    @OneToMany(mappedBy = "foodSafety", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Source> sources = new java.util.ArrayList<>();
}