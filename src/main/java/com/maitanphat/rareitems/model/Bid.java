package com.maitanphat.rareitems.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Bid(
        Long id,
        Long itemId,
        String bidderName,
        BigDecimal amount,
        LocalDateTime bidTime
) {
}
