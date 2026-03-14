package com.maitanphat.rareitems.dto;

import com.maitanphat.rareitems.model.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Display name is required.")
        @Size(max = 80, message = "Display name must be at most 80 characters.")
        String displayName,

        @NotBlank(message = "Username is required.")
        @Size(max = 50, message = "Username must be at most 50 characters.")
        String username,

        @NotBlank(message = "Password is required.")
        @Size(min = 6, max = 100, message = "Password must be from 6 to 100 characters.")
        String password,

        @NotNull(message = "Role is required.")
        UserRole role
) {
}
