import { merge } from "lodash"
import { makeAutoObservable } from "mobx"

import { timeDeltaInMinutes, uuid } from "../util"

export class CacheItem<TItem extends IAnyObject> {
  // ====================================================
  // Model
  // ====================================================
  id: string
  cachedAt: Date
  data: TItem = {} as TItem

  // ====================================================
  // Constructor
  // ====================================================
  constructor(private props: TItem, public ttl: number) {
    makeAutoObservable(this)

    this.id = (this.props.id || uuid()).toString()
    this.cachedAt = new Date()
    this.data = props
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
  update = (data: TItem, opts = { merge: true }) => {
    if (opts?.merge) {
      this.data = merge(this.data, data)
    } else {
      this.data = data
    }

    return this.data as TItem
  }

  merge = (data: Partial<TItem>) => {
    this.data = merge(this.data, data)
    return this.data
  }
}
