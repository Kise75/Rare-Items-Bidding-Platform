package com.maitanphat.rareitems.dto;

import com.maitanphat.rareitems.model.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Họ và tên là bắt buộc.")
        @Size(max = 80, message = "Họ và tên tối đa 80 ký tự.")
        String displayName,

        @NotBlank(message = "Tên đăng nhập là bắt buộc.")
        @Size(max = 50, message = "Tên đăng nhập tối đa 50 ký tự.")
        String username,

        @NotBlank(message = "Mật khẩu là bắt buộc.")
        @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự.")
        String password,

        @NotNull(message = "Vai trò là bắt buộc.")
        UserRole role
) {
}
