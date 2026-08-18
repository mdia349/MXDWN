package com.mxdwn.api.exception;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException(String email) {
        super("An account already exists for " + email);
    }
}
