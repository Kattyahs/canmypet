package com.canmypet.foodservice.exception;

public class EmergencyGuideNotFoundException extends RuntimeException {
    public EmergencyGuideNotFoundException(String riskLevel) {
        super("No emergency guide found for risk level '" + riskLevel + "'");
    }
}