package com.t7.seal.config;

import com.t7.seal.filter.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String API = ApiPaths.API_V1;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth

                        // Public Auth
                        .requestMatchers(HttpMethod.POST,
                                API + "/auth/register",
                                API + "/auth/verify-email",
                                API + "/auth/login",
                                API + "/auth/forgot-password",
                                API + "/auth/reset-password"
                        ).permitAll()

                        // Public Read
                        .requestMatchers(HttpMethod.GET,
                                API + "/events",
                                API + "/events/*",
                                API + "/events/*/rounds",
                                API + "/events/*/tracks",
                                API + "/events/*/announcements",
                                API + "/events/*/rankings",
                                API + "/events/*/prizes",
                                API + "/rounds/*",
                                API + "/rounds/*/rankings",
                                API + "/tracks/*",
                                API + "/tracks/*/rankings",
                                API + "/prizes/*",
                                API + "/announcements/*"
                        ).permitAll()

                        // Admin only
                        .requestMatchers(API + "/system/config/**").hasRole("ADMIN")
                        .requestMatchers(API + "/system/health").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, API + "/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, API + "/users/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, API + "/users/*/deactivate").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, API + "/criteria").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, API + "/criteria/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, API + "/criteria/*").hasRole("ADMIN")

                        // Admin + Coordinator
                        .requestMatchers(HttpMethod.GET, API + "/users").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/users/*").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/system/audit-logs").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/criteria").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(API + "/exports/**").hasAnyRole("ADMIN", "COORDINATOR")

                        // Coordinator
                        .requestMatchers(HttpMethod.GET, API + "/users/pending-approval").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/users/*/approve").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/users/*/reject").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/users/guest-judge").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/events").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/events/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/events/*").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/events/*/publish-results").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/events/*/variance-dashboard").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/events/*/announcements").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.PATCH, API + "/announcements/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/announcements/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/publish").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/unpublish").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/pin").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/unpin").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/mark-result").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/unmark-result").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/events/*/rounds").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/rounds/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/rounds/*").hasRole("COORDINATOR")
                        .requestMatchers(API + "/rounds/*/advance-rules/**").hasRole("COORDINATOR")
                        .requestMatchers(API + "/advance-rules/**").hasRole("COORDINATOR")
                        .requestMatchers(API + "/rounds/*/judge-assignments/**").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/rounds/*/lock-submissions").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/rounds/*/lock-grading").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/rounds/*/scoring-progress").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/rounds/*/advancement-preview").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/rounds/*/confirm-advancement").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/events/*/tracks").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/tracks/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/tracks/*").hasRole("COORDINATOR")
                        .requestMatchers(API + "/tracks/*/mentor-assignments/**").hasRole("COORDINATOR")
                        .requestMatchers(API + "/mentor-assignments/**").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/events/*/criteria").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/event-criteria/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/event-criteria/*").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/calibration/*/publish-distribution").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/submissions/*/disqualify").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/disqualifications/*/appeal").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/events/*/prizes").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/prizes/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/prizes/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/prizes/*/award").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/prizes/*/clear-award").hasRole("COORDINATOR")

                        .requestMatchers(HttpMethod.POST, API + "/events/*/notifications").hasRole("COORDINATOR")

                        // Judge
                        .requestMatchers(API + "/grading/**").hasRole("JUDGE")
                        .requestMatchers(HttpMethod.GET, API + "/calibration/*").hasAnyRole("JUDGE", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/calibration/*/scores").hasRole("JUDGE")
                        .requestMatchers(HttpMethod.GET, API + "/calibration/*/distribution").hasAnyRole("JUDGE", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/rounds/*/criteria").hasAnyRole("JUDGE", "COORDINATOR")

                        // Mentor
                        .requestMatchers(API + "/mentor/**").hasRole("MENTOR")
                        .requestMatchers(HttpMethod.GET, API + "/tracks/*/teams").hasRole("MENTOR")

                        // Authenticated routes.
                        // Ownership should be checked with @PreAuthorize guards.
                        .requestMatchers(API + "/users/me/**").authenticated()
                        .requestMatchers(API + "/teams/**").authenticated()
                        .requestMatchers(API + "/invitations/**").authenticated()
                        .requestMatchers(API + "/submissions/**").authenticated()
                        .requestMatchers(API + "/submission-links/**").authenticated()
                        .requestMatchers(API + "/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, API + "/auth/logout").authenticated()

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                CorsConfiguration corsConfiguration = new CorsConfiguration();

                corsConfiguration.setAllowedOriginPatterns(List.of(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1:5173"
                ));

                corsConfiguration.setAllowedMethods(List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                ));

                corsConfiguration.setAllowedHeaders(List.of("*"));
                corsConfiguration.setAllowCredentials(true);
                corsConfiguration.setExposedHeaders(List.of("Authorization"));
                corsConfiguration.setMaxAge(3600L);

                return corsConfiguration;
            }
        };
    }
}
