# 🚧 🚨 Under construction

# mobx-blocks

MobX classes designed for solving common problems encountered when building dashboard-style web applications.

## Collection

Stores some data, exposes computed props

HOTTAKES.COM, 80 char limit, 3 per day

```typescript
interface ComputedProps {
  fetching: boolean
  fetchErr?: Error
  fetchErrMessage?: string // TODO

  searching: boolean
  searchErr?: Error
  searchErrMessage?: string // TODO
}
```

... and methods

```typescript
interface {
  fetch: (queryParams) =>
}
```

Can be used with static data (TODO) to do all of the above client side

### Examples

Simplest example to manage static data

```typescript
const data = new
const countries = new Collection({ initialData: ["Foo", "Bar", "Baz"] })
```

We can now do any of these

```typescript
countries.
```

[Usage](https://github.com/Peterabsolon/mobx-blocks/blob/main/src/demo/src/Products/Products.store.tsx#L9)

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
