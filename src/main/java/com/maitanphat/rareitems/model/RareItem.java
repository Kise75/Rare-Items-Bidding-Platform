package com.maitanphat.rareitems.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RareItem(
        Long id,
        String name,
        String category,
        String description,
        String imageUrl,
        BigDecimal startingPrice,
        BigDecimal currentPrice,
        AuctionStatus status,
        LocalDateTime createdAt
) {
    public RareItem withCurrentPrice(BigDecimal updatedPrice) {
        return new RareItem(
                id,
                name,
                category,
                description,
                imageUrl,
                startingPrice,
                updatedPrice,
                status,
                createdAt
        );
    }

    public RareItem withStatus(AuctionStatus updatedStatus) {
        return new RareItem(
                id,
                name,
                category,
                description,
                imageUrl,
                startingPrice,
                currentPrice,
                updatedStatus,
                createdAt
        );
    }
}
