package com.dreamspace.api.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() {
        super("Неправильний пароль");
    }
}
