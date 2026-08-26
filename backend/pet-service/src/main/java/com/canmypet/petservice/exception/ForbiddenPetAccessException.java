package com.canmypet.petservice.exception;

public class ForbiddenPetAccessException extends RuntimeException {
    public ForbiddenPetAccessException() {

      super("You do not have permission to access this pet");
    }
}
