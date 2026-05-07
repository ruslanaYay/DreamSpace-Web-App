package com.dreamspace.api.dto;

public class AuthResponse {
    private long id;
    private String email;
    private String token;

    public AuthResponse(long id, String email, String token) {
        this.id = id;
        this.email = email;
        this.token = token;
    }

    public long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getToken() {
        return token;
    }
}
