# TODO.md

## ✅ COMPLETED TODAY

- [x] Thorough audit (frontend + backend, all API calls, N+1 spots, start-up behavior) — see the earlier report.
- [x] TypeScript and ESLint clean. Frontend builds (code-split routes, lazy admin pages). Main bundle now ~567 KB, admin chunk loads only on `/admin` (~512 KB gzip) instead of one huge 1.27 MB entry.
- [x] Backend compiles clean after changes.
- [x] **KILL N+1**
  - `TourRepository`: added `@EntityGraph` for destination/category/createdBy on lists/single tour; did **not** join the `images` collection on paged queries (avoids in-memory paging); `images` still resolved efficiently via `@BatchSize` + `spring.jpa.properties.hibernate.default_batch_fetch_size=64`.
  - `TourServiceImpl`: only paged/sorted lists use the graph; findById also covered.
  - `ReviewServiceImpl`: capped `/tours/{id}/reviews` to 20 newest (prevents unbounded public list).
- [x] **AGGREGATE QUERIES**
  - `PaymentRepository.sumAllAmounts()` → `COALESCE(SUM(amount),0)` (replaces loading all payments in DashboardServiceImpl).
  - `RefundRepository.countByStatus(PENDING)` → replaces scanning all refunds.
  - `ReviewRepository.avgRatingByTourId()` + `countByTourId()` → replaces loading all reviews to compute average.
- [x] **SMALL PERF FIXES**
  - `NotificationServiceImpl.createForAdmins()` now `userRepository.findByRoles_Name("ADMIN")` instead of `findAll()` + filtering.
  - `Destination.images` → `FetchType.LAZY` + `@BatchSize(size=50)`.
  - `Tour.images` and `Tour.schedules` → `@BatchSize` added.
  - **application.properties:** `show-sql=false`, `maximum-pool-size=10` (up from 5), `minimum-idle=2`, `default_batch_fetch_size=64`, removed duplicate `initialization-fail-timeout`.
  - **UserController:** added `GET /api/v1/users/guides` (public). **SecurityConfig:** whitelisted `GET /api/v1/users/guides`.
  - **AboutPage:** now calls `/api/v1/users/guides` (no longer hits the admin-only `/users` and filters client-side; 401s avoided).
  - **Tour facets API:** added `TourFacetsResponse`, `TourRepository.countPublishedBy*`, `TourService.getFacets()`, `GET /api/v1/tours/facets`. **HomePage** now uses `/tours/page?size=8&isPublished=true`, `/reviews/page?size=6`, and `/tours/facets` (avoids `GET /tours` and `GET /reviews` full lists + client-side slicing/filtering). **DestinationDetailPage** now calls `/tours/page` filtered by `destinationId` (no longer downloads all tours).
  - **DestinationsPage:** converted `useEffect` → `useQuery` (cached across navigation).
  - **AdminLayout:** notification polling gated to `document.visibilityState === 'visible'` (less background churn).
  - **BookingPages:** checkout tour fetch made async/await + unmount guard (no `.then()`).
  - Removed unused deps (`ollama`, `i18next`, `react-i18next`, `autoprefixer`, `postcss`).
  - Added route-level lazy imports + `<Suspense>` fallback.
  - Fixed **DataSeeder** LazyInitializationException + `orphanRemoval` collection replacement (use `clear()` + `addAll()`).

## 🚀 WHAT TO DO NEXT (PRIORITY ORDER)

### Backend (faster API responses)
1. [ ] **OSIV OFF (after mappers safer)**: set `spring.jpa.open-in-view=false` in `application.properties`. Many mappers dereference lazy fields; with OSIV currently true, it "hides" N+1s. After the repo-level `@EntityGraph` + `@BatchSize` above, you can disable it and fix any straggling services that access lazy fields outside a transaction (most list endpoints already `@Transactional(readOnly=true)`).
2. [ ] **Reports**: in `ReportServiceImpl`, replace `bookingRepository.findAll()` and `paymentRepository.findAll()` with specifications/queries filtered by `status` + `bookingDate/paidAt` between dates and `ORDER BY` in SQL (currently filters in Java — loads everything). Add methods like `findByStatusAndBookingDateBetween(...)` or use `JpaSpecificationExecutor`.
3. [ ] **Mappers → DTO projections** (biggest win long-term): for paged list endpoints (`/tours/page`, `/bookings/page`, `/reviews/page`, `/payments/page`, `/refunds/page`, `/schedules/page`, `/users/page`), use Spring Data **interface projections** or JPQL constructor expressions (`new TourListDto(...)`) to only select needed columns (skip full entities). This also removes mapper traversal almost entirely.
4. [ ] **Add indexes** (Postgres): create indexes on common filter/sort columns: `tours(destination_id, category_id, is_published, created_at/id)`, `bookings(user_id, schedule_id, status, booking_date)`, `reviews(tour_id, created_at)`, `payments(booking_id, status, paid_at)`, `schedules(tour_id, start_date, status)`. (Can be a Flyway migration or `schema.sql` in `src/main/resources/db/`.)
5. [ ] **Destination entity graph**: if any admin endpoint lists destinations with large image lists, consider `@EntityGraph(attributePaths={"images"})` on `findAll(Specification, Pageable/Sort)` for destinations too.
6. [ ] **ReviewService.getAllReviews()**: should be paged or limited for admin UI (it currently returns `findAllByOrderByCreatedAtDesc()` with no size cap; `AdminReviews` already uses `/reviews/page`, but the unpaginated `/reviews` exists and is public — maybe deprecate or cap it).

### Frontend (load faster, feel snappier)
7. [ ] **Convert remaining `useEffect` fetchers to React Query** (get caching/dedupe/staleTime free):
   - `AdminCategories` (already has `reloadKey` logic — can switch to `useQuery` + `queryClient.invalidateQueries`)
   - `AdminDestinations`, `AdminRoles`, `AdminSettings` (all fetch-all then paginate client-side)
   - Also `BookingPages` (the checkout tour fetch is now async but still manual; can use `useQuery` with `enabled`)
8. [ ] **Stop client-side pagination for admin small tables**: `usePagedQuery` already exists and backend has `/page` for bookings/payments/refunds/reviews/tours/schedules/users. Add `/categories/page`, `/destinations/page`, `/roles/page`, `/settings/page` on backend (with `PageResponse`) and swap those admin pages to server-side paging (cuts payload size dramatically if tables grow).
9. [ ] **Dashboard/Reports**: they still call `/bookings`, `/payments`, `/refunds` (unpaginated). Since charts need aggregates over time ranges, prefer **new endpoints** returning pre-aggregated series (e.g. `GET /api/v1/dashboard/revenue-series?days=7,14,30`, `GET /api/v1/reports/bookings-summary?from&to`) instead of downloading every booking/payment/refund. That’s the single biggest frontend+backend win for large datasets.
10. [ ] **Add Vite manual chunks** (optional but nice): split `recharts`, `framer-motion`, `react-hook-form`/`zod` into separate chunks in `vite.config.ts` (`build.rollupOptions.output.manualChunks`) to avoid any single vendor chunk from growing.
11. [ ] **Remove `extractData` legacy paths** where we already use `select` + paged shape; keep consistent.

### Ops / Hygiene
12. [ ] `.env.example` / docs: document `VITE_API_URL`, JWT/DB/SMTP/Cloudinary env vars. (Currently `.env.local` only has Vercel token.)
13. [ ] **application.properties:** set `spring.jpa.open-in-view=false` after #1 validation (run through admin + public flows). Also consider `spring.datasource.hikari.idle-timeout`, `max-lifetime` tuning if deploying to Render/Neon.
14. [ ] **Security:** `SecurityConfig` currently `permitAll()` for `GET /api/v1/reviews` (unpaginated). With the new paged `/reviews/page`, maybe restrict the unpaginated one to ADMIN or remove it if unused.
15. [ ] **Logging:** `logging.file.name=logs/application.log` is fine locally; in containerized prod, prefer stdout only.

## HOW TO TEST LOCALLY

1. Backend: `.\mvnw spring-boot:run` → http://localhost:8080 (health: `GET /api/v1/tours/page?page=0&size=1` returns 200 in ~60ms with current fixes)
2. Frontend: `npm run dev` → http://localhost:5173
3. Build: `npm run build` (code-split, tsc + vite) — should no new TS errors
4. Lint: `npm run lint`

## NOTES ON THIS SESSION

- Committed no changes (you asked to "continue works", not to git commit). All edits are local.
- The `audit_report.txt` was deleted from working tree (staged delete). Safe to keep or restore.
- `HomePage` now fetches 8 featured tours + 6 recent reviews + facets instead of all tours/reviews. `DestinationDetailPage` fetches tours only for that destination.
- Route lazy-loading + repo-level graphs + aggregate queries should make `localhost:5173` feel **much faster** on first load and when browsing.
- `@BatchSize` + `default_batch_fetch_size=64` cover the mappers' lazy traversals (destination/category/createdBy/user/booking/schedule/tour) so adding them back is cheap.

**If you want, I can also fix #9 (dashboard aggregates endpoints) or #8 (server-side paging for categories/destinations/roles/settings) next.** Which one should I tackle first?
