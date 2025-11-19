package com.debate.util;

import com.debate.entity.User;
import com.debate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {
    private final UserRepository userRepository;

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElse(null);
            return user != null ? user.getId() : null;
        }

        return null;
    }

    public User getCurrentUser() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElse(null);
    }
}

