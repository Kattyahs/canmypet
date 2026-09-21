package com.canmypet.foodservice.exception;

import com.canmypet.foodservice.model.Species;

public class FoodSafetyNotFoundException extends RuntimeException {
    public FoodSafetyNotFoundException(Long id) {
        super("FoodSafety entry with id " + id + " not found");
    }

    public FoodSafetyNotFoundException(Long foodId, Species species) {
        super("No FoodSafety entry found for foodId " + foodId + " and species '" + species + "'");
    }
}