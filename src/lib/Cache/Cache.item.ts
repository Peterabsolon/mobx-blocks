import { makeAutoObservable } from "mobx"

export class CacheItem<TItem extends IObjectWithId> {
  // ====================================================
  // Model
  // ====================================================
  id: string
  cachedAt: Date

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public data: TItem) {
    makeAutoObservable(this)

    this.id = this.data.id.toString()
    this.cachedAt = new Date()
  }

  // ====================================================
  // Computed
  // ====================================================
  get isStale() {
    return false
  }

  // ====================================================
  // Actions
  // ====================================================
  update = (data: TItem) => {
    this.data = data
  }
}
