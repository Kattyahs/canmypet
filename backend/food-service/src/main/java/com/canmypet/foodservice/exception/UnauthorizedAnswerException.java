package com.canmypet.foodservice.exception;

public class UnauthorizedAnswerException extends RuntimeException {
    public UnauthorizedAnswerException(String message) {
        super(message);
    }
}