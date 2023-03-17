import { makeAutoObservable } from "mobx"

export class CacheQuery<TItem extends IObjectWithId> {
  // ====================================================
  // State
  // ====================================================
  cachedAt: Date

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public items: TItem[]) {
    makeAutoObservable(this)

    this.cachedAt = new Date()
  }

  // ====================================================
  // Computed
  // ====================================================
  get isStale() {
    // TODO:
    return false
  }
}
