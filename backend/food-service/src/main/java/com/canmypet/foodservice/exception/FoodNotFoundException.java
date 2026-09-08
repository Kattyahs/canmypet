package com.canmypet.foodservice.exception;

public class FoodNotFoundException extends RuntimeException {
    public FoodNotFoundException(Long id) {
        super("Food with id " + id + " not found");
    }
}