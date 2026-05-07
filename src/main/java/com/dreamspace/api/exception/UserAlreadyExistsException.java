package com.dreamspace.api.exception;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException() {
        super("Користувач з такими даними вже існує");
    }
}
