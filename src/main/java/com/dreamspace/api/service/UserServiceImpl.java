package com.dreamspace.api.service;

import com.dreamspace.api.entity.User;
import com.dreamspace.api.dto.UserDTO;
import com.dreamspace.api.exception.UserAlreadyExistsException;
import com.dreamspace.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(UserDTO userDTO) {
        // Перевірка, чи існує email
        Optional<User> existingUser = userRepository.findByEmail(userDTO.getEmail());
        if (existingUser.isPresent()) {
            throw new UserAlreadyExistsException();
        }
        //Створення нового запису
        User user = new User(
                userDTO.getFirstName(),
                userDTO.getLastName(),
                userDTO.getEmail(),
                //Хешування пароля
                this.passwordEncoder.encode(userDTO.getPassword())
        );
        user.setRole(User.Role.USER);
        return userRepository.save(user);
    }
}
