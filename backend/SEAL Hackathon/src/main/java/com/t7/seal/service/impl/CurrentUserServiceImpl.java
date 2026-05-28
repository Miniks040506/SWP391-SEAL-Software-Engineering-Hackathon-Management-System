package com.t7.seal.service.impl;

import com.t7.seal.entities.User;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurrentUserServiceImpl implements CurrentUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(Authentication authentication) {
        UUID userId = CurrentUser.id(authentication);

        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
