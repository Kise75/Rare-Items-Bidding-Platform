package com.maitanphat.rareitems.service;

import com.maitanphat.rareitems.dto.CreateItemRequest;
import com.maitanphat.rareitems.dto.PlaceBidRequest;
import com.maitanphat.rareitems.exception.BusinessRuleException;
import com.maitanphat.rareitems.exception.ResourceNotFoundException;
import com.maitanphat.rareitems.model.AuctionStatus;
import com.maitanphat.rareitems.model.Bid;
import com.maitanphat.rareitems.model.RareItem;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class AuctionService {

    private static final Comparator<Bid> BID_RANKING =
            Comparator.comparing(Bid::amount).thenComparing(Bid::bidTime).reversed();

    private final Map<Long, RareItem> itemStore = new ConcurrentHashMap<>();
    private final Map<Long, List<Bid>> bidStore = new ConcurrentHashMap<>();
    private final AtomicLong itemIdSequence = new AtomicLong(0);
    private final AtomicLong bidIdSequence = new AtomicLong(0);

    public AuctionService() {
        seedDemoData();
    }

    public List<RareItem> getAllItems() {
        return itemStore.values().stream()
                .sorted(Comparator.comparing(RareItem::id))
                .toList();
    }

    public RareItem getItemById(Long itemId) {
        RareItem item = itemStore.get(itemId);
        if (item == null) {
            throw new ResourceNotFoundException("Item with id " + itemId + " was not found.");
        }
        return item;
    }

    public RareItem createItem(CreateItemRequest request) {
        Long itemId = itemIdSequence.incrementAndGet();
        BigDecimal startingPrice = normalizeMoney(request.startingPrice());

        RareItem item = new RareItem(
                itemId,
                normalizeText(request.name(), "Unnamed item"),
                normalizeText(request.category(), "Uncategorized"),
                normalizeText(request.description(), "No description."),
                startingPrice,
                startingPrice,
                AuctionStatus.OPEN,
                LocalDateTime.now()
        );

        itemStore.put(itemId, item);
        bidStore.put(itemId, new CopyOnWriteArrayList<>());
        return item;
    }

    public List<Bid> getBidsByItem(Long itemId) {
        getItemById(itemId);
        return bidStore.getOrDefault(itemId, List.of())
                .stream()
                .sorted(BID_RANKING)
                .toList();
    }

    public Bid placeBid(Long itemId, PlaceBidRequest request) {
        RareItem item = getItemById(itemId);

        if (item.status() != AuctionStatus.OPEN) {
            throw new BusinessRuleException("Auction is closed for item " + itemId + ".");
        }

        BigDecimal bidAmount = normalizeMoney(request.amount());
        if (bidAmount.compareTo(item.currentPrice()) <= 0) {
            throw new BusinessRuleException(
                    "Bid amount must be greater than current price (" + item.currentPrice() + ")."
            );
        }

        Bid bid = new Bid(
                bidIdSequence.incrementAndGet(),
                itemId,
                normalizeText(request.bidderName(), "Anonymous"),
                bidAmount,
                LocalDateTime.now()
        );

        bidStore.computeIfAbsent(itemId, ignored -> new CopyOnWriteArrayList<>()).add(bid);
        itemStore.put(itemId, item.withCurrentPrice(bidAmount));
        return bid;
    }

    public RareItem updateAuctionStatus(Long itemId, AuctionStatus status) {
        RareItem item = getItemById(itemId);
        if (item.status() == status) {
            return item;
        }

        RareItem updatedItem = item.withStatus(status);
        itemStore.put(itemId, updatedItem);
        return updatedItem;
    }

    private void seedDemoData() {
        createItem(new CreateItemRequest(
                "Vintage Mechanical Watch",
                "Watch",
                "Swiss watch from the 1970s in very good condition.",
                new BigDecimal("5000000")
        ));

        createItem(new CreateItemRequest(
                "Porcelain Tea Set",
                "Ceramic",
                "Hand-painted collectible tea set with original box.",
                new BigDecimal("2500000")
        ));
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizeText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }
}
