# Rare-Items-Bidding-Platform

Rare Items Bidding Platform (COS141 - Application Development using J2EE)

## Progress 1 (Week 1)

Implemented a basic auction API skeleton with Spring Boot:

- `GET /welcome`: simple welcome endpoint
- `GET /api/items`: list all auction items
- `GET /api/items/{itemId}`: view item details
- `POST /api/items`: create a new item
- `GET /api/items/{itemId}/bids`: list bids of an item
- `POST /api/items/{itemId}/bids`: place a bid

Notes:

- Current implementation uses in-memory storage for fast iteration in week 1.
- Input validation and common error responses are included.
- A week-1 report file is available at `BAO_CAO_TIEN_DO_1.md`.
