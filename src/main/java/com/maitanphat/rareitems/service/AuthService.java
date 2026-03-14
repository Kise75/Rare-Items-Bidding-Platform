package com.maitanphat.rareitems.service;

import com.maitanphat.rareitems.dto.AuthResponse;
import com.maitanphat.rareitems.dto.LoginRequest;
import com.maitanphat.rareitems.dto.RegisterRequest;
import com.maitanphat.rareitems.exception.BusinessRuleException;
import com.maitanphat.rareitems.model.UserRole;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final Map<String, UserAccount> accounts = new ConcurrentHashMap<>();

    public AuthService() {
        seedAccounts();
    }

    public AuthResponse register(RegisterRequest request) {
        String username = normalize(request.username());
        String usernameKey = username.toLowerCase();
        UserRole role = request.role();

        if (accounts.containsKey(usernameKey)) {
            throw new BusinessRuleException("Tên đăng nhập đã tồn tại.");
        }

        if (role == null) {
            throw new BusinessRuleException("Vai trò là bắt buộc.");
        }

        if (role == UserRole.ADMIN) {
            throw new BusinessRuleException("Không thể tự đăng ký tài khoản quản trị viên.");
        }

        UserAccount account = new UserAccount(
                normalize(request.displayName()),
                username,
                request.password().trim(),
                role
        );

        accounts.put(usernameKey, account);
        return toResponse(account);
    }

    public AuthResponse login(LoginRequest request) {
        String username = normalize(request.username());
        String usernameKey = username.toLowerCase();
        UserAccount account = accounts.get(usernameKey);

        if (account == null || !account.password().equals(request.password().trim())) {
            throw new BusinessRuleException("Tên đăng nhập hoặc mật khẩu không đúng.");
        }

        return toResponse(account);
    }

    private AuthResponse toResponse(UserAccount account) {
        return new AuthResponse(
                account.displayName(),
                account.username(),
                account.role()
        );
    }

    private void seedAccounts() {
        accounts.put("admin", new UserAccount("Quản trị viên", "admin", "123456", UserRole.ADMIN));
        accounts.put("seller1", new UserAccount("Người bán 01", "seller1", "123456", UserRole.SELLER));
        accounts.put("bidder1", new UserAccount("Người đấu giá 01", "bidder1", "123456", UserRole.BIDDER));
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim();
    }

    private record UserAccount(
            String displayName,
            String username,
            String password,
            UserRole role
    ) {
    }
}
