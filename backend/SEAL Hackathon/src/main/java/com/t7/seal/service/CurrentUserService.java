package com.t7.seal.service;

import com.t7.seal.entities.User;
import org.springframework.security.core.Authentication;

public interface CurrentUserService {
    User getCurrentUser(Authentication authentication);
}