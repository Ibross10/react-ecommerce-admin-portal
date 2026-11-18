# Coffee R Us — React E-commerce Store & Admin Portal

A responsive React single-page application for a fictional coffee store. The customer-facing storefront follows the supplied C5M8 mock-up: a warm coffee-coloured hero, Home / Shop / Admin Portal navigation, a search and origin-filter sidebar, and a responsive grid of coffee cards. The administrator portal provides product catalogue management.

## Features

### Customer storefront
- **Home:** introduces Coffee R Us and links to the shop.
- **Shop:** displays the coffee catalogue in a responsive product grid.
- **Dynamic search:** filters products by name, description, origin, or category as the user types.
- **Origin filters:** filter the catalogue by one or more coffee origins.
- **Product details:** each product has a dedicated page showing its origin, description, price, and availability.

### Administrator portal
- **Overview:** displays total products, total units in stock, low-stock items, and recently added products.
- **Catalogue:** searches the catalogue and provides product detail, edit, and delete actions.
- **Create product:** adds a product with name, description, origin, category, price, stock, label, and card accent.
- **Product detail:** quickly updates price and stock using a PATCH request.
- **Edit product:** updates the full set of product fields.
- **Feedback:** loading, empty, form validation, success, and API error states.

## Technology

- React 19 and JavaScript
- React Router for client-side routing
- Standard React hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, and `useContext`
- Custom `useProducts` hook with a shared Products Context
- JSON Server as the simulated REST backend
- Vite for development and production builds
- Vitest, React Testing Library, and user-event for automated tests

## Getting started

Requirements: Node.js 22 or newer and npm.

1. Clone this repository:

   ```bash
   git clone https://github.com/Ibross10/react-ecommerce-admin-portal.git
   cd react-ecommerce-admin-portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the React frontend and JSON Server together:

   ```bash
   npm run dev:full
   ```

4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). JSON Server runs on `http://localhost:4000`.

You can also start each service in a separate terminal with `npm run dev` and `npm run api`.

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Customer storefront home page |
| `/shop` | Shop catalogue, dynamic search, and origin filters |
| `/shop/:id` | Customer-facing product details |
| `/admin` | Administrator overview |
| `/admin/products` | Product catalogue and delete controls |
| `/admin/products/new` | Add a product |
| `/admin/products/:id` | Product details and quick price/stock update |
| `/admin/products/:id/edit` | Edit all product fields |

## REST API and CRUD

JSON Server persists the simulated backend data in `db.json`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/products` | Read the product catalogue |
| `GET` | `/products/:id` | Read one product |
| `POST` | `/products` | Create a product |
| `PATCH` | `/products/:id` | Update selected product fields |
| `DELETE` | `/products/:id` | Delete a product |

The API base URL defaults to `http://localhost:4000`. Copy `.env.example` to `.env` and set `VITE_API_URL` to use a different backend URL.

## Component hierarchy

```text
main.jsx
└── BrowserRouter
    └── ProductsProvider
        └── App (React Router)
            ├── StorefrontLayout
            │   ├── StoreHomePage
            │   ├── ShopPage
            │   │   └── StoreProductCard
            │   └── ShopProductPage
            └── AdminLayout
                ├── AdminOverview
                │   └── ProductCard
                ├── AdminProductsPage
                │   └── ProductCard
                ├── ProductFormPage
                └── AdminProductDetailPage
```

## State and props

- `ProductsProvider` owns the shared products, loading, and error state, and exposes refresh, create, update, and delete operations.
- `useProducts` is a custom hook that lets components access shared product state without prop drilling.
- `ProjectFormPage` owns form values and receives create/update actions through the custom hook.
- `ShopPage` owns the search term and selected origin filters; `useMemo` derives the displayed products.
- `AdminProductsPage` owns catalogue search and delete-confirmation state.
- Product cards receive product data through props and display reusable product information.

## Testing

Run all tests:

```bash
npm test
```

Run the tests in watch mode:

```bash
npm run test:watch
```

The tests cover client-side navigation, dynamic shop search, administrator product creation, quick PATCH updates, and confirmed deletion. GitHub Actions runs the tests and production build for pushes to `main` and `feature/**`, and for pull requests targeting `main`.

## Production build

```bash
npm run build
npm run preview
```

## Sample data

The fictional Coffee R Us store includes sample coffee products from Colombia, Vietnam, Ethiopia, and Kenya. Prices are shown in Kenyan shillings (KES). Update `db.json` to customise the sample store details and product catalogue.
