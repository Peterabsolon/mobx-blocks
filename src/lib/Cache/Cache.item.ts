import { makeAutoObservable } from "mobx"

import { timeDeltaInMinutes } from "../util"

export class CacheItem<TItem extends IObjectWithId> {
  // ====================================================
  // Model
  // ====================================================
  id: string
  cachedAt: Date

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public data: TItem, public ttl: number) {
    makeAutoObservable(this)

    this.id = this.data.id.toString()
    this.cachedAt = new Date()
  }

  // ====================================================
  // Computed
  // ====================================================
  isStale = (now: Date): boolean => {
    return timeDeltaInMinutes(now, this.cachedAt) > this.ttl
  }

  // ====================================================
  // Actions
  // ====================================================
  update = (data: TItem) => {
    this.data = data
  }
}
