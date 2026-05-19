package com.dreamspace.api.service;

import com.dreamspace.api.dto.AuthResponse;
import com.dreamspace.api.dto.LoginDTO;
import com.dreamspace.api.dto.UserDTO;
import com.dreamspace.api.entity.User;

public interface UserService {
    // Метод для реєстрації нового користувача
    User registerUser(UserDTO userDTO);
    User loginUser(LoginDTO loginDTO);
}
