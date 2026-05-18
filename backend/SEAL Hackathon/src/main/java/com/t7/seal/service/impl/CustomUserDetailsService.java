package com.t7.seal.service.impl;

import com.t7.seal.domain.UserStatus;
import com.t7.seal.dto.UserPrincipal;
import com.t7.seal.entities.User;
import com.t7.seal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        boolean enabled = user.getStatus() == UserStatus.ACTIVE;

        boolean accountNonLocked = user.getLockedUntil() == null
                || LocalDateTime.now().isAfter(user.getLockedUntil());

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                enabled,
                accountNonLocked
        );
    }
}
