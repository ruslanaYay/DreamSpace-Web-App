package com.dreamspace.api.service;

import com.dreamspace.api.dto.UserDTO;
import com.dreamspace.api.entity.User;

public interface UserService {
    // Метод для реєстрації нового користувача
    User registerUser(UserDTO userDTO);
}
