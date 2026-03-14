package com.maitanphat.rareitems.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record PlaceBidRequest(
        @NotBlank(message = "Bidder name is required.")
        @Size(max = 80, message = "Bidder name must be at most 80 characters.")
        String bidderName,

        @NotNull(message = "Bid amount is required.")
        @DecimalMin(value = "0.01", message = "Bid amount must be greater than 0.")
        BigDecimal amount
) {
}
