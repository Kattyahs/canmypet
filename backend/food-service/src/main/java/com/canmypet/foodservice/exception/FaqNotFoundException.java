package com.canmypet.foodservice.exception;

public class FaqNotFoundException extends RuntimeException {
    public FaqNotFoundException(Long id) {
        super("FAQ with id " + id + " not found");
    }
}