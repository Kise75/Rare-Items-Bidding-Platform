# Rare-Items-Bidding-Platform

Rare Items Bidding Platform (COS141 - Application Development using J2EE)

## Progress 1 (Week 1)

Implemented a basic auction API skeleton with Spring Boot:

- `GET /welcome`: web UI page for the project MVP
- `GET /api/welcome`: simple welcome endpoint (text)
- `GET /api/items`: list all auction items
- `GET /api/items/{itemId}`: view item details
- `POST /api/items`: create a new item
- `GET /api/items/{itemId}/bids`: list bids of an item
- `POST /api/items/{itemId}/bids`: place a bid

Notes:

- Current implementation uses in-memory storage for fast iteration in week 1.
- Input validation and common error responses are included.
- Frontend MVP is available at `/welcome` and connected directly to the API above.
- A week-1 report file is available at `BAO_CAO_TIEN_DO_1.md`.

## Progress 2 (Week 2)

Improved the MVP into a more complete demo:

- `POST /api/auth/register`: register a seller or bidder account
- `POST /api/auth/login`: log in with a demo account
- Role-based UI actions for bidder, seller, and admin
- Functional admin panel to open/close auction sessions
- Vietnamese UI polish with search, sort, pagination, and image fallback

Notes:

- The project is still using in-memory storage at this stage.
- A week-2 report file is available at `BAO_CAO_TIEN_DO_2.md`.
