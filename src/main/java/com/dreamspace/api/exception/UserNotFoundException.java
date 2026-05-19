package com.dreamspace.api.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException() {
        super("Користувача з такими даними не знайдено");
    }
}
