package com.maitanphat.rareitems.dto;

import com.maitanphat.rareitems.model.UserRole;

public record AuthResponse(
        String displayName,
        String username,
        UserRole role
) {
}
