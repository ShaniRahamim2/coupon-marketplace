# Coupon Marketplace

Backend system for a digital coupon marketplace. 
Supports selling coupons to direct customers (frontend) and to external resellers (REST API).

Built with Node.js, Express, PostgreSQL, and Docker.

## Running the Project

Make sure you have Docker and Docker Compose installed, then:

```bash
git clone https://github.com/ShaniRahamim2/coupon-marketplace.git
cd coupon-marketplace
docker-compose up --build
```

Wait until you see `Server running on port 3000`, then open http://localhost:3000 

To stop: `Ctrl+C` then run `docker-compose down`. Add `-v` to also clear the database.

## Project Structure

The backend code is in `src/` and follows a layered pattern - controllers, services, and repositories.
Controllers handle HTTP, services have the business logic (pricing, validation), and the repository deals with the database.

The frontend is kept minimal (as required) - single HTML file in `frontend/build/` with React loaded from a CDN.

## API Endpoints

Reseller API - needs `Authorization: Bearer test-reseller-token-123`
- `GET /api/v1/products` - available products (unsold only, no internal pricing info)
- `GET /api/v1/products/:id` - single product
- `POST /api/v1/products/:id/purchase` - buy a coupon, body: `{ "reseller_price": 120 }`

Admin API - needs `Authorization: Bearer admin-secret-token-456`
- `GET /api/admin/products` - all products including sold
- `POST /api/admin/products` - create product
- `PUT /api/admin/products/:id` - update product
- `DELETE /api/admin/products/:id` - delete product

Customer API - no auth
- `GET /api/customer/products` - available coupons
- `POST /api/customer/products/:id/purchase` - buy a coupon


## Notes

- Pricing is calculated server-side: `cost_price * (1 + margin_percentage / 100)`. Customers and resellers never see the internal cost/margin.
- Purchases are atomic - uses `SELECT ... FOR UPDATE` to lock the row so two people can't buy the same coupon.
- Resellers must send a price >= minimum_sell_price, customers just pay the minimum automatically.
- The `type` column defaults to 'COUPON' but supports adding other product types later.
