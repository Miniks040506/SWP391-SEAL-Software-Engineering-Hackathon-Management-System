package com.t7.seal.config;

import com.t7.seal.filter.JwtAuthenticationFilter;
import com.t7.seal.security.CustomAccessDeniedHandler;
import com.t7.seal.security.JwtAuthenticationEntryPoint;
import com.t7.seal.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.t7.seal.security.oauth2.OAuth2AuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(endpoint -> endpoint
                                .baseUri(API + "/auth/oauth2/authorization")
                        )
                        .redirectionEndpoint(endpoint -> endpoint
                                .baseUri(API + "/auth/oauth2/callback/*")
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler)
                )
                .authorizeHttpRequests(auth -> auth

                        // CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Swagger
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Public Auth
                        .requestMatchers(HttpMethod.POST,
                                API + "/auth/register",
                                API + "/auth/verify-email",
                                API + "/auth/login",
                                API + "/auth/refresh-token",
                                API + "/auth/forgot-password",
                                API + "/auth/reset-password"
                        ).permitAll()

                        // OAuth2
                        .requestMatchers(
                                API + "/auth/oauth2/authorization/**",
                                API + "/auth/oauth2/callback/**"
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
                                API + "/announcements/*",
                                API + "/rankings/**"
                        ).permitAll()

                        // Current user routes. Must be before /users/*.
                        .requestMatchers(HttpMethod.GET, API + "/users/me").authenticated()
                        .requestMatchers(HttpMethod.PATCH, API + "/users/me").authenticated()
                        .requestMatchers(HttpMethod.PATCH, API + "/users/me/password").authenticated()
                        .requestMatchers(HttpMethod.POST, API + "/users/me/avatar").authenticated()

                        // Admin only
                        .requestMatchers(API + "/system/config/**").hasRole("ADMIN")
                        .requestMatchers(API + "/system/health").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, API + "/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, API + "/users/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, API + "/users/*/deactivate").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, API + "/criteria").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/criteria/*").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/criteria/*/deactivate").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/criteria/*/activate").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/criteria/*").hasAnyRole("ADMIN", "COORDINATOR")

                        // Admin + Coordinator
                        .requestMatchers(HttpMethod.GET, API + "/users/assignable").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/users").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/users/*").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/system/audit-logs").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/criteria").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/criteria/*").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(API + "/exports/**").hasAnyRole("ADMIN", "COORDINATOR")

                        // Coordinator account review
                        .requestMatchers(HttpMethod.GET, API + "/users/pending-approval").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/users/*/approve").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/users/*/reject").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/users/guest-judge").hasRole("COORDINATOR")

                        // Coordinator event operations
                        .requestMatchers(HttpMethod.POST, API + "/events").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/events/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/events/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/events/*/publish-results").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/events/*/variance-dashboard").hasRole("COORDINATOR")

                        // Announcements
                        .requestMatchers(HttpMethod.POST, API + "/events/*/announcements").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/announcements/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/announcements/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/publish").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/unpublish").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/pin").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/unpin").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/announcements/*/mark-result").hasRole("COORDINATOR")

                        // Rounds, advance rules, judge assignments
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

                        // Tracks and mentor assignments
                        .requestMatchers(HttpMethod.POST, API + "/events/*/tracks").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/tracks/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/tracks/*").hasRole("COORDINATOR")
                        .requestMatchers(API + "/tracks/*/mentor-assignments/**").hasRole("COORDINATOR")
                        .requestMatchers(API + "/mentor-assignments/**").hasRole("COORDINATOR")

                        // Criteria
                        .requestMatchers(HttpMethod.POST, API + "/events/*/criteria").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/event-criteria/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/event-criteria/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/rounds/*/criteria").hasAnyRole("JUDGE", "COORDINATOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, API + "/rounds/*/criteria").hasAnyRole("JUDGE", "COORDINATOR")

                        // Calibration
                        .requestMatchers(HttpMethod.POST, API + "/calibrations").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/calibrations/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/calibrations/*/publish-distribution").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/calibrations/**").hasAnyRole("JUDGE", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/calibrations/*/scores").hasRole("JUDGE")

                        // Disqualification
                        .requestMatchers(HttpMethod.POST, API + "/disqualifications").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/disqualifications/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/disqualifications/*/appeal").hasAnyRole("STUDENT", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/disqualifications/*/overturn").hasRole("COORDINATOR")

                        // Prizes
                        .requestMatchers(HttpMethod.POST, API + "/prizes").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.PATCH, API + "/prizes/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, API + "/prizes/*").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/prizes/*/award").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/prizes/*/clear-award").hasRole("COORDINATOR")

                        // Judge grading
                        .requestMatchers(API + "/grading/**").hasRole("JUDGE")

                        // Mentor
                        .requestMatchers(API + "/mentor-feedback/**").hasAnyRole("MENTOR", "STUDENT", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, API + "/tracks/*/teams").hasAnyRole("MENTOR", "COORDINATOR")

                        // Student/team/submission
                        .requestMatchers(API + "/teams/**").hasAnyRole("STUDENT", "COORDINATOR")
                        .requestMatchers(API + "/submissions/**").hasAnyRole("STUDENT", "JUDGE", "MENTOR", "COORDINATOR")
                        .requestMatchers(API + "/submission-links/**").hasAnyRole("STUDENT", "COORDINATOR")

                        // Notifications
                        .requestMatchers(HttpMethod.POST, API + "/notifications").hasRole("COORDINATOR")
                        .requestMatchers(HttpMethod.POST, API + "/notifications/*/send").hasRole("COORDINATOR")
                        .requestMatchers(API + "/notifications/**").authenticated()

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
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