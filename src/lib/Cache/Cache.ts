import { IObservableArray, makeAutoObservable, observable, values } from "mobx"
import { keyBy } from "lodash"

import { toEntries } from "../util"

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

  /**
   * If passed, enables caching list queries.
   * The queries are keyed in the cache by a toString() representation of URLSearchParams.
   * TODO: Use URLSearchParams
   */
  fetchList?: (params: IAnyObject) => Promise<TItem[]>
}

export class Cache<TItem extends IObjectWithId> {
  // ====================================================
  // State
  // ====================================================
  private items = observable<string, CacheItem<TItem>>(new Map())
  private queries = observable<string, CacheQuery<TItem>>(new Map())

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
        acc.push([item.id.toString(), new CacheItem(item)])
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
  readOne = (id: string | number): CacheItem<TItem> | undefined => {
    return this.items.get(id.toString())
  }

  getOne = (id: string | number): Promise<CacheItem<TItem> | undefined> => {
    return Promise.resolve(undefined)
  }

  getList = (query: string): Promise<TItem[]> => {
    if (!this.config?.fetchList) {
      console.warn("")
      return Promise.resolve([])
    }

    const cachedQuery = this.queries.get(query)
    if (cachedQuery && !cachedQuery.isStale) {
      return Promise.resolve(cachedQuery.items)
    }

    return Promise.resolve([])
  }

  set = (item: TItem): TItem => {
    const cachedItem = this.items.get(item.id.toString())
    if (cachedItem && !cachedItem.isStale) {
      cachedItem.update(item)
      return cachedItem.data
    }

    const newItem = new CacheItem(item)
    this.items.set(item.id.toString(), newItem)

    return newItem.data
  }
}
