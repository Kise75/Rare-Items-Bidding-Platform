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
            throw new ResourceNotFoundException("Không tìm thấy vật phẩm có id " + itemId + ".");
        }
        return item;
    }

    public RareItem createItem(CreateItemRequest request) {
        Long itemId = itemIdSequence.incrementAndGet();
        String normalizedName = normalizeText(request.name(), "Vật phẩm chưa đặt tên");
        String normalizedCategory = normalizeText(request.category(), "Khác");
        String normalizedDescription = normalizeText(request.description(), "Chưa có mô tả.");
        String normalizedImageUrl = normalizeImageUrl(request.imageUrl(), defaultImageByCategory(normalizedCategory));
        BigDecimal startingPrice = normalizeMoney(request.startingPrice());

        RareItem item = new RareItem(
                itemId,
                normalizedName,
                normalizedCategory,
                normalizedDescription,
                normalizedImageUrl,
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
            throw new BusinessRuleException("Phiên đấu giá của vật phẩm " + itemId + " đã đóng.");
        }

        BigDecimal bidAmount = normalizeMoney(request.amount());
        if (bidAmount.compareTo(item.currentPrice()) <= 0) {
            throw new BusinessRuleException(
                    "Giá đặt phải lớn hơn giá hiện tại (" + item.currentPrice() + ")."
            );
        }

        Bid bid = new Bid(
                bidIdSequence.incrementAndGet(),
                itemId,
                normalizeText(request.bidderName(), "Người dùng ẩn danh"),
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
                "Đồng hồ cơ cổ điển",
                "Đồng hồ",
                "Đồng hồ cơ phong cách cổ điển, máy chạy ổn định, phù hợp sưu tầm.",
                "https://picsum.photos/seed/rare-watch/1200/800",
                new BigDecimal("5000000")
        ));

        createItem(new CreateItemRequest(
                "Bộ ấm trà sứ thủ công",
                "Gốm sứ",
                "Bộ ấm trà sứ vẽ tay, còn hộp bảo quản, thích hợp trưng bày.",
                "https://picsum.photos/seed/rare-tea-set/1200/800",
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

    private String normalizeImageUrl(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private String defaultImageByCategory(String category) {
        String normalized = category.toLowerCase();
        if (normalized.contains("đồng hồ") || normalized.contains("dong ho") || normalized.contains("watch")) {
            return "https://picsum.photos/seed/default-watch/1200/800";
        }
        if (normalized.contains("tiền") || normalized.contains("tien") || normalized.contains("coin")) {
            return "https://picsum.photos/seed/default-coin/1200/800";
        }
        if (normalized.contains("tranh") || normalized.contains("art")) {
            return "https://picsum.photos/seed/default-art/1200/800";
        }
        return "https://picsum.photos/seed/default-collectible/1200/800";
    }
}
