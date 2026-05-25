package com.dreamspace.api.exception;

public class WishNotFoundException extends RuntimeException {
    public WishNotFoundException() {
        super("Вказане бажання не знайдено");
    }
}