package com.maitanphat.rareitems.service;

import com.maitanphat.rareitems.dto.CreateItemRequest;
import com.maitanphat.rareitems.dto.PlaceBidRequest;
import com.maitanphat.rareitems.exception.BusinessRuleException;
import com.maitanphat.rareitems.exception.ResourceNotFoundException;
import com.maitanphat.rareitems.model.Bid;
import com.maitanphat.rareitems.model.RareItem;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AuctionServiceTest {

    @Test
    void shouldCreateItemSuccessfully() {
        AuctionService auctionService = new AuctionService();
        int initialSize = auctionService.getAllItems().size();

        RareItem createdItem = auctionService.createItem(new CreateItemRequest(
                "Antique Compass",
                "Antique",
                "Brass compass from the early 1900s.",
                new BigDecimal("1200000")
        ));

        List<RareItem> allItems = auctionService.getAllItems();

        assertEquals(initialSize + 1, allItems.size());
        assertEquals("Antique Compass", createdItem.name());
        assertEquals(new BigDecimal("1200000.00"), createdItem.currentPrice());
    }

    @Test
    void shouldPlaceHigherBidSuccessfully() {
        AuctionService auctionService = new AuctionService();
        RareItem createdItem = auctionService.createItem(new CreateItemRequest(
                "Collector Coin",
                "Coin",
                "Limited mint coin.",
                new BigDecimal("300000")
        ));

        Bid placedBid = auctionService.placeBid(
                createdItem.id(),
                new PlaceBidRequest("Mai Tan Phat", new BigDecimal("450000"))
        );

        RareItem updatedItem = auctionService.getItemById(createdItem.id());
        List<Bid> bids = auctionService.getBidsByItem(createdItem.id());

        assertEquals(new BigDecimal("450000.00"), placedBid.amount());
        assertEquals(new BigDecimal("450000.00"), updatedItem.currentPrice());
        assertFalse(bids.isEmpty());
    }

    @Test
    void shouldRejectBidNotHigherThanCurrentPrice() {
        AuctionService auctionService = new AuctionService();
        RareItem createdItem = auctionService.createItem(new CreateItemRequest(
                "Collector Poster",
                "Poster",
                "Signed movie poster.",
                new BigDecimal("800000")
        ));

        assertThrows(
                BusinessRuleException.class,
                () -> auctionService.placeBid(
                        createdItem.id(),
                        new PlaceBidRequest("Bidder A", new BigDecimal("799999"))
                )
        );
    }

    @Test
    void shouldThrowNotFoundForUnknownItem() {
        AuctionService auctionService = new AuctionService();

        assertThrows(
                ResourceNotFoundException.class,
                () -> auctionService.getItemById(9999L)
        );
    }
}
