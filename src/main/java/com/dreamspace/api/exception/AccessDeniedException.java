package com.dreamspace.api.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException() {
        super("Доступ заборонено");
    }
}
