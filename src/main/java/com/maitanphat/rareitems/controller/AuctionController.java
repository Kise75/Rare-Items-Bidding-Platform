package com.maitanphat.rareitems.controller;

import com.maitanphat.rareitems.dto.CreateItemRequest;
import com.maitanphat.rareitems.dto.PlaceBidRequest;
import com.maitanphat.rareitems.model.AuctionStatus;
import com.maitanphat.rareitems.model.Bid;
import com.maitanphat.rareitems.model.RareItem;
import com.maitanphat.rareitems.service.AuctionService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping
    public List<RareItem> getAllItems() {
        return auctionService.getAllItems();
    }

    @GetMapping("/{itemId}")
    public RareItem getItemById(@PathVariable Long itemId) {
        return auctionService.getItemById(itemId);
    }

    @PostMapping
    public ResponseEntity<RareItem> createItem(@Valid @RequestBody CreateItemRequest request) {
        RareItem createdItem = auctionService.createItem(request);
        return ResponseEntity
                .created(URI.create("/api/items/" + createdItem.id()))
                .body(createdItem);
    }

    @GetMapping("/{itemId}/bids")
    public List<Bid> getBidsByItem(@PathVariable Long itemId) {
        return auctionService.getBidsByItem(itemId);
    }

    @PostMapping("/{itemId}/bids")
    public ResponseEntity<Bid> placeBid(
            @PathVariable Long itemId,
            @Valid @RequestBody PlaceBidRequest request
    ) {
        Bid placedBid = auctionService.placeBid(itemId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(placedBid);
    }

    @PatchMapping("/{itemId}/status")
    public RareItem updateItemStatus(
            @PathVariable Long itemId,
            @RequestParam("value") AuctionStatus status
    ) {
        return auctionService.updateAuctionStatus(itemId, status);
    }
}
