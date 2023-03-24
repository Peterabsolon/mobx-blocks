import { makeAutoObservable, observable, values } from "mobx"

import { CacheItem } from "./Cache.item"
import { CacheQuery } from "./Cache.query"

const DEFAULT_TTL_MINUTES = 5

export interface ICacheConfig<TItem extends IAnyObject> {
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
      const items = initialData.reduce((acc, item) => {
        acc.push([item.id.toString(), new CacheItem(item, this.ttl)])
        return acc
      }, [] as [string, CacheItem<TItem>][])

      this.items.replace(items)
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
  saveOne = (item: TItem) => {
    const cacheItem = new CacheItem(item, this.ttl)
    this.items.set(cacheItem.id, cacheItem)
    return cacheItem
  }

  readOne = (id: string | number): CacheItem<TItem> | undefined => {
    return this.items.get(id.toString())
  }

  updateOne = (id: string | number, item: TItem) => {
    const cachedItem = this.readOne(id)
    if (cachedItem) {
      cachedItem.update(item)
      return cachedItem.data
    }

    const newCachedItem = this.saveOne(item)
    return newCachedItem.data
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
    const items = data.map(this.saveOne)

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

  readQuery = (queryString: string): CacheQuery<TItem> | undefined => {
    return this.queries.get(queryString)
  }
}
