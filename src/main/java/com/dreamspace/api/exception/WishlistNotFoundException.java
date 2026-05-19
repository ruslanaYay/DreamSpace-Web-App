package com.dreamspace.api.exception;

public class WishlistNotFoundException extends RuntimeException {
    public WishlistNotFoundException() {
      super("Вказаний вішліст не знайдено");
    }
}
