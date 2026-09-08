package com.canmypet.foodservice.exception;

public class UnauthorizedVerificationException extends RuntimeException {
    public UnauthorizedVerificationException(String message) {
        super(message);
    }
}