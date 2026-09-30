package com.canmypet.petservice.exception;

public class PhotoNotFoundException extends RuntimeException {
    public PhotoNotFoundException(Long petId) {
        super("Pet " + petId + " has no photo");
    }
}