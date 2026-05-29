package com.dreamspace.api.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException() {
        super("Доступ заборонено");
    }
    public AccessDeniedException(String message) {
        super(message);
    }
}
