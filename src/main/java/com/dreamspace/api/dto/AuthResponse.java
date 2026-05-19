package com.dreamspace.api.dto;

public class AuthResponse {
    private long id;
    private String email;
    private String token;
    private String role;

    public AuthResponse(long id, String email, String token, String role) {
        this.id = id;
        this.email = email;
        this.token = token;
        this.role = role;
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

    public String getRole() {
        return role;
    }
}
