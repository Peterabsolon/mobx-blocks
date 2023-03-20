# mobx-blocks (beta)

MobX classes designed for solving common problems encountered when building dashboard-style web applications. With 100% test coverage.

## Collection

Given an async fetch function like:

```typescript
type Product = { id: string }
type FetchFn = (params: Record<string, any>) => Promise<{ data: Product[] }>
```

We can pass it to a new Collection to let it manage the following:

### Storing the data (boring on its own)

```typescript
const products = new Collection({ fetchFn })
console.log(c.data) // type Product[] inferred from fetchFn return
```

### TODO: Fetching with aborts

### TODO: Searching with debounce

### Sorting

```typescript
const products = new Collection({
  fetchFn,
  sortBy: "id" as "id" | "title",
})

products.sorting.sort("id") // fetchFn call (triggered automatically by reaction)
products.sorting.toggleDirection() // fetchFn call
products.sorting.setParams("title", true) // fetchFn call
```

### Filtering

```typescript
const products = new Collection({
  fetchFn,
  initialFilters: { title: "Foo", valid: false } as ProductQueryParams,
})

products.filters.set("title", "Bar") // fetchFn call
products.filters.get("title")
products.filters.merge({ title: "Bar" }) // valid: false persists, fetchFn call
products.filters.replace({ title: "Bar" }) // valid:false gets removed, fetchFn call
products.filters.reset() // reset to initialFilters, fetchFn call
```

### Selection (TODO)

```typescript
const products = new Collection({ fetchFn })

await products.fetch()

products.selection.select(products.data.?[0]) // added to selection
products.selection.select(products.data.?[0]) // removed from selection
```

### Caching

```typescript
import { Cache, Collection } from "mobx-blocks"

// The Cache will be our source of truth so we create it first and pass it to the Collection
const productsCache = new Cache({ ttl: 3 }) // in minutes
const products = new Collection({ fetchFn, fetchOne, cache: productsCache })

await products.fetch({ sortBy: "title", ascending: false }) // fetchFn call
await products.fetch({ sortBy: "title", ascending: false }) // called with same params -> result returned from Cache
await products.fetchOne("id") // given this id exists in cache no fetchOne call will be made
await products.fetchOne("id", { useCache: false }) // we can bypass this behaviour if the fetchOne returns more detailed data
```

### synchronizing query params to URL

```typescript
const products = new Collection({
  fetchFn,
  sortBy: "title",
  initialFilters: { foo: "foo", bar: "bar" },
  syncParamsToUrl: true, // TODO: pass filter function
})

products.fetch()

// ...URL now contains ?sortBy=title&sortAscending=true&foo=foo&bar=bar
```

### TODO: initializing from query string

```typescript
const products = new Collection({
  fetchFn,
  sortBy: null as null | "title",
  initialFilters: { foo: "", bar: "" },
})

products.init({ queryString: "?sortBy=title&sortAscending=true&foo=foo&bar=bar" })

console.log(products.sorting.params) // { sortBy: "title", ascending: true }
console.log(products.filters.active) // { foo: "foo", bar: "bar" }
```

[Kitchen-sink example](https://github.com/Peterabsolon/mobx-blocks/blob/main/src/demo/src/Products/Products.store.tsx#L9)

[Source](https://github.com/Peterabsolon/mobx-blocks/blob/main/src/lib/Collection.ts#L7)

[Types](https://github.com/Peterabsolon/mobx-blocks/blob/main/src/lib/Collection.types.ts)

## Cache

[TODO] Manages caching of list/detail queries

## Pagination

[TODO] Manages pagination

## Filters

[TODO] Manages filters

## Selection

[TODO] Manages filters

## Notifications

[TODO] Manages notifications

## Modals

[TODO] Manages modals
