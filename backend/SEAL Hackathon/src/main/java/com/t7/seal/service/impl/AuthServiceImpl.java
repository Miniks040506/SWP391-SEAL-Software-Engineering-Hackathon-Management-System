package com.t7.seal.service.impl;

import com.t7.seal.repository.UserRepository;
import com.t7.seal.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;


}
