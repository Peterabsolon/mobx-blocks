import { makeAutoObservable } from "mobx"

import { CacheItem } from "./Cache.item"

export class CacheQuery<TItem extends IObjectWithId> {
  // ====================================================
  // State
  // ====================================================
  cachedAt: Date

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public items: CacheItem<TItem>[]) {
    makeAutoObservable(this)

    this.cachedAt = new Date()
  }

  // ====================================================
  // Computed
  // ====================================================
  get data(): TItem[] {
    return this.items.map((item) => item.data)
  }

  get isStale() {
    // TODO:
    return false
  }
}
