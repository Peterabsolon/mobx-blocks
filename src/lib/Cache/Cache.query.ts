import { makeAutoObservable } from "mobx"

import { timeDeltaInMinutes } from "../util"

import { CacheItem } from "./Cache.item"

export class CacheQuery<TItem extends IAnyObject> {
  // ====================================================
  // State
  // ====================================================
  cachedAt: Date

  // ====================================================
  // Constructor
  // ====================================================
  constructor(
    public items: CacheItem<TItem>[],
    public ttl: number,
    public prevPageCursor: string | null = null,
    public nextPageCursor: string | null = null,
    public totalCount?: number
  ) {
    makeAutoObservable(this)

    this.cachedAt = new Date()
  }

  // ====================================================
  // Computed
  // ====================================================
  get data(): TItem[] {
    return this.items.map((item) => item.data)
  }

  isStale = (now: Date): boolean => {
    return timeDeltaInMinutes(now, this.cachedAt) > this.ttl
  }
}
