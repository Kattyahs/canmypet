package com.canmypet.foodservice.exception;

public class FoodSafetyNotFoundException extends RuntimeException {
    public FoodSafetyNotFoundException(Long id) {
        super("FoodSafety entry with id " + id + " not found");
    }

    public FoodSafetyNotFoundException(Long foodId, String species) {
        super("No FoodSafety entry found for foodId " + foodId + " and species '" + species + "'");
    }
}