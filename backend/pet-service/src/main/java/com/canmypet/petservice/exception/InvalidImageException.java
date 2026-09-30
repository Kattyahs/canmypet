package com.canmypet.petservice.exception;

public class InvalidImageException extends RuntimeException {
    public InvalidImageException(String message) {
        super(message);
    }
}