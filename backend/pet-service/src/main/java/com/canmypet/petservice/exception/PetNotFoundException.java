package com.canmypet.petservice.exception;

public class PetNotFoundException extends RuntimeException {
    public PetNotFoundException(Long id) {
        super("Pet with id " + id + " not found");
    }
}
