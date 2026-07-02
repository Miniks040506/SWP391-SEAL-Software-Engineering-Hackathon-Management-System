package com.t7.seal.service;

import com.t7.seal.entities.User;

public interface PasswordHistoryService {
    void validateNotReused(User user, String rawPassword);
    void recordPassword(User user, String passwordHash);
}
