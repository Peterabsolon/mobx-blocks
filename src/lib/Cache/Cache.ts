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
   * If passed, enables caching list queries
   */
  fetchList?: (queryString: string) => Promise<TItem[]>

  /**
   * If passed, enables caching getOne queries
   */
  fetchOne?: (id: string | number) => Promise<TItem | undefined>
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
  readOne = (id: string | number): TItem | undefined => {
    return this.items.get(id.toString())?.data
  }

  getOne = async (id: string | number, useCache = true): Promise<TItem | undefined> => {
    if (!this.config?.fetchOne) {
      console.warn("")
      return undefined
    }

    const cachedItem = this.items.get(id.toString())
    if (cachedItem && !cachedItem.isStale && useCache) {
      return cachedItem.data
    }

    const data = await this.config.fetchOne(id)
    if (!data) {
      return undefined
    }

    const item = new CacheItem(data)
    this.items.set(id.toString(), item)
    return item.data
  }

  getList = async (queryString = ""): Promise<TItem[]> => {
    if (!this.config?.fetchList) {
      console.warn("")
      return []
    }

    const cachedQuery = this.queries.get(queryString)
    if (cachedQuery && !cachedQuery.isStale) {
      return Promise.resolve(cachedQuery.data)
    }

    const data = await this.config.fetchList(queryString)
    const items = data.map(this.set)
    const query = new CacheQuery(items)
    this.queries.set(queryString, query)

    return query.data
  }

  set = (item: TItem): CacheItem<TItem> => {
    const cachedItem = this.items.get(item.id.toString())
    if (cachedItem && !cachedItem.isStale) {
      cachedItem.update(item)
      return cachedItem
    }

    const newItem = new CacheItem(item)
    this.items.set(item.id.toString(), newItem)

    return newItem
  }
}
