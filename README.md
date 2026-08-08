# Nua Market

A React Native product discovery app built with Expo and TypeScript. Nua Market uses the DummyJSON Products API to provide paginated browsing, debounced search, category discovery, product details, related products, a persisted cart, offline catalog fallback, analytics logging, and theme preferences.

## Demo Walkthrough

[Watch the 2–3 minute Loom walkthrough](https://www.loom.com/share/27e8cab450964b748847ff477b49ecdb)

The walkthrough covers:

- Product listing, deals, and categories
- Debounced search
- Product details and related products
- Cart quantity controls and persistence
- Theme preferences
- Analytics activity history
- Return Policy WebView

## Features

- Paginated product listing with infinite scroll
- Debounced API search using `/products/search?q=`
- Category browsing using the DummyJSON category API
- Top deals carousel sorted by discount percentage
- Product detail screen with:
  - Image carousel
  - Discounted price calculation
  - Rating and review count
  - Availability and shipping information
  - Related products
  - Return Policy WebView
- Redux Toolkit cart with:
  - Add, remove, increase, and decrease actions
  - Cart badge and subtotal
  - AsyncStorage persistence
- Floating Home, Cart, and Settings navigation tray
- System, light, and dark theme preferences
- Persisted analytics activity log for:
  - `product_viewed`
  - `add_to_cart`
  - `search_performed`
  - `app_backgrounded`
- Exponential retry for network and server errors
- Cached product pages for offline fallback
- Pagination retry and refresh coordination
- Search race-condition protection
- Memoized product cards and tuned list virtualization

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Redux Toolkit and React Redux
- React Navigation
- AsyncStorage
- React Native WebView
- Expo Vector Icons
- Jest with `jest-expo`

## Getting Started

### Requirements

- Node.js compatible with the installed Expo SDK
- npm
- Expo Go, Android Studio, or Xcode depending on the target platform
- Network access for the DummyJSON API and remote product images

### Installation

```bash
npm install
```

### Start the development server

```bash
npm start
```

Then choose a target from the Expo CLI:

- Press `a` for Android
- Press `i` for iOS
- Press `w` for web
- Scan the QR code with Expo Go

### Platform scripts

```bash
npm run android
npm run ios
npm run web
```

If Metro or Expo is using stale state, restart with:

```bash
npx expo start --clear
```

For a physical device, LAN mode is generally more reliable than a tunnel:

```bash
npx expo start --lan
```

The device and development machine must be connected to the same network. Use localhost mode for an emulator running on the same machine:

```bash
npx expo start --localhost
```

## Testing and Validation

Run the TypeScript compiler:

```bash
npx tsc --noEmit
```

Run the test suite:

```bash
npm test
```

The test suite includes a search race-condition test. It starts a `phone` request, starts a newer `laptop` request, resolves the older request last, and verifies that only the latest search results remain in state.

## Architecture

### Navigation

The app uses nested React Navigation stacks so the floating tab tray remains mounted across product browsing:

```text
NavigationContainer
└── MainTabs
    ├── Home
    │   └── HomeStack
    │       ├── Catalog
    │       ├── ProductDetail
    │       └── ReturnPolicy
    ├── Cart
    └── Settings
```

### Redux store

The store is split by responsibility:

- `productsSlice`: catalog data, search, categories, top deals, pagination, loading, errors, and offline state
- `cartSlice`: cart items, quantities, subtotal, and hydration state
- `settingsSlice`: system/light/dark theme preference
- `analyticsSlice`: persisted mock analytics events

Product listing state is global because it is shared across catalog interactions. Immediate text input remains local to the search component so typing stays responsive; debounced searches dispatch Redux actions.

### API and retry behavior

The app uses these DummyJSON endpoints:

- `GET /products?limit=20&skip=...`
- `GET /products/search?q=...&limit=20&skip=...`
- `GET /products/category/:category?limit=20&skip=...`
- `GET /products/:id`
- `GET /products?sortBy=discountPercentage&order=desc&limit=6`
- `GET /products/categories`

All product requests use a shared retry helper:

1. Initial request immediately
2. Retry after 1 second
3. Retry after 2 seconds
4. Retry after 4 seconds

Network errors and HTTP `5xx` responses are retried. HTTP `4xx` responses are treated as non-retryable errors.

### Search race protection

Each request is associated with its query and category. Redux only applies a response if it still matches the current query context. This prevents a slower request for an older search from replacing newer results.

### Offline behavior

Successful product responses are cached in AsyncStorage using the query, category, and pagination offset as the cache key. If a matching API request fails, the cached response is displayed and the catalog shows an `Offline data` indicator. A retry remains available to request fresh data.

The cart, theme preference, and analytics history are also persisted locally.

## Analytics

Analytics are intentionally mocked and stored locally. The shared `trackEvent` helper dispatches a Redux event and logs the same normalized event to the console.

Each event includes an ISO timestamp and relevant metadata:

- `product_viewed`: product ID and title
- `add_to_cart`: product ID and title
- `search_performed`: search query
- `app_backgrounded`: previous and next app states

The latest 100 events are shown in Settings and can be cleared by the user.

## Project Structure

```text
src/
├── components/       Reusable UI and persistence components
├── navigation/       Root tabs and nested Home stack
├── screens/          Catalog, detail, cart, settings, and WebView screens
├── services/         API, retry, and product cache services
├── store/            Redux slices, store, and typed hooks
├── theme/            Light/dark palettes and theme resolution
├── types/            Shared TypeScript models
└── utils/            Shared analytics helpers
```

## Assumptions and Trade-offs

- DummyJSON is treated as a read-only catalog API. Cart changes are local and are not sent to a backend.
- Redux Toolkit was chosen over Context API or Zustand because product and cart state are shared across nested navigation flows, and Redux Toolkit gives predictable async state handling with minimal boilerplate.
- AsyncStorage is sufficient for this take-home app. A production app would use a more deliberate cache strategy, expiration, and migration handling.
- Discounted prices are calculated client-side from `price` and `discountPercentage`.
- The Return Policy uses a public static WebView URL because the API does not provide a dedicated policy page URL.
- Analytics are local mock events only. No external analytics SDK or backend is used.
- The checkout flow is intentionally outside the current scope because the assignment focuses on listing, detail, cart state, persistence, and navigation.
- The catalog cache is keyed by request context and is intended as an offline fallback, not a complete offline synchronization layer.

## Take-Home Requirement Checklist

- [x] Product listing from DummyJSON
- [x] Pagination and infinite scroll
- [x] Debounced search endpoint
- [x] Product details
- [x] Multi-image carousel
- [x] Discounted price calculation
- [x] Cart state with Redux Toolkit
- [x] Cart persistence with AsyncStorage
- [x] Return Policy WebView
- [x] `product_viewed` analytics
- [x] `add_to_cart` analytics
- [x] `search_performed` analytics
- [x] `app_backgrounded` analytics
- [x] Loading, empty, and error states
- [x] Search race-condition protection
- [x] Exponential retry for network and server errors
- [x] Pull-to-refresh coordination
- [x] Dark mode with persisted preference
- [x] Offline catalog fallback
- [x] Race-condition test

## Improvements With More Time

- Add checkout, order creation, and payment integration
- Add stronger unit coverage for retry, cache fallback, cart persistence, and analytics
- Add end-to-end tests for search, navigation, cart, and offline flows
- Use a network information library for explicit online/offline state rather than inferring it from request failures
- Add cache expiration, invalidation, and storage size management
- Add image caching and progressive image loading
- Replace the static Return Policy URL with a product or environment-specific policy URL
- Add accessibility review with screen-reader and larger-text testing
- Add CI checks for TypeScript, tests, and formatting
- Connect analytics to a real event pipeline
