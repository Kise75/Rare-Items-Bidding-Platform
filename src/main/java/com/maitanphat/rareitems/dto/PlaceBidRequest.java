package com.maitanphat.rareitems.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PlaceBidRequest(
        @NotBlank(message = "Tên người đấu giá là bắt buộc.")
        @Size(max = 80, message = "Tên người đấu giá tối đa 80 ký tự.")
        String bidderName,

        @NotNull(message = "Số tiền đặt giá là bắt buộc.")
        @DecimalMin(value = "0.01", message = "Số tiền đặt giá phải lớn hơn 0.")
        BigDecimal amount
) {
}
