package com.maitanphat.rareitems.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateItemRequest(
        @NotBlank(message = "Tên vật phẩm là bắt buộc.")
        @Size(max = 100, message = "Tên vật phẩm tối đa 100 ký tự.")
        String name,

        @Size(max = 50, message = "Danh mục tối đa 50 ký tự.")
        String category,

        @Size(max = 300, message = "Mô tả tối đa 300 ký tự.")
        String description,

        @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự.")
        String imageUrl,

        @NotNull(message = "Giá khởi điểm là bắt buộc.")
        @DecimalMin(value = "0.01", message = "Giá khởi điểm phải lớn hơn 0.")
        BigDecimal startingPrice
) {
}
