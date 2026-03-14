package com.maitanphat.rareitems.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateItemRequest(
        @NotBlank(message = "Item name is required.")
        @Size(max = 100, message = "Item name must be at most 100 characters.")
        String name,

        @Size(max = 50, message = "Category must be at most 50 characters.")
        String category,

        @Size(max = 300, message = "Description must be at most 300 characters.")
        String description,

        @NotNull(message = "Starting price is required.")
        @DecimalMin(value = "0.01", message = "Starting price must be greater than 0.")
        BigDecimal startingPrice
) {
}
