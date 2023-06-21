import { makeAutoObservable, observable, values } from "mobx"

import { CacheItem } from "./Cache.item"
import { CacheQuery } from "./Cache.query"

const DEFAULT_TTL_MINUTES = 5

export interface ICacheConfig<TItem extends IObjectWithId> {
  /**
   * How long should cached items or queries be used before refreshing, in minutes
   * @default 5
   */
  ttl?: number

  /**
   * Optionally provide initial data
   */
  initialData?: TItem[]
}

export class Cache<TItem extends IObjectWithId> {
  // ====================================================
  // State
  // ====================================================
  items = observable<string, CacheItem<TItem>>(new Map())
  queries = observable<string, CacheQuery<TItem>>(new Map())
  ttl: number

  // ====================================================
  // Constructor
  // ====================================================
  constructor(private readonly config?: ICacheConfig<TItem>) {
    makeAutoObservable(this)

    const { initialData, ttl = DEFAULT_TTL_MINUTES } = this.config || {}

    this.ttl = ttl

    if (initialData) {
      this.items.replace(
        initialData.reduce((acc: [string, CacheItem<TItem>][], item: TItem) => {
          acc.push([item.id.toString(), new CacheItem(item, this.ttl)])
          return acc
        }, [])
      )
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get data(): TItem[] {
    return values(this.items).map((item) => item.data)
  }

  // ====================================================
  // Actions
  // ====================================================
  set = (item: TItem) => {
    const cacheItem = new CacheItem(item, this.ttl)
    this.items.set(cacheItem.id, cacheItem)
    return cacheItem
  }

  get = (id: string | number): CacheItem<TItem> | undefined => {
    return this.items.get(id.toString())
  }

  save = (item: TItem, invalidate = true): TItem => {
    if (invalidate) {
      this.invalidateQueries()
    }

    const cached = this.get(item.id)
    if (cached) {
      return cached.merge(item)
    }

    return this.set(item as TItem).data
  }

  delete = (id: string | number) => {
    this.items.delete(id.toString())
  }

  invalidateQueries = () => {
    console.log("invalidate")
    this.queries.clear()
  }

  saveQuery = (
    queryString: string,
    data: TItem[],
    responseData: {
      prevPageCursor?: string
      nextPageCursor?: string
      totalCount?: number
    }
  ) => {
    const items = data.map((item) => {
      const cached = this.get(item.id)
      if (cached) {
        cached.update(item)
        return cached
      }

      return this.set(item)
    })

    const query = new CacheQuery(
      items,
      this.ttl,
      responseData.prevPageCursor,
      responseData.nextPageCursor,
      responseData.totalCount
    )

    this.queries.set(queryString, query)

    return query
  }

  getQuery = (queryString: string): CacheQuery<TItem> | undefined => {
    return this.queries.get(queryString)
  }

  clear = () => {
    this.items.clear()
    this.queries.clear()
  }
}
