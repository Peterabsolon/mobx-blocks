import { makeAutoObservable } from "mobx"

export interface ISortingConfig<TSortBy extends string | undefined = string> {
  onChange?: () => void
  key?: TSortBy
  ascending?: boolean
}

export interface ISortingParams<TSortBy extends string | undefined = string> {
  sortBy?: TSortBy
  sortAscending?: boolean
}

export class Sorting<TSortBy extends string | undefined = string> {
  // ====================================================
  // Model
  // ====================================================
  key?: TSortBy
  ascending: boolean

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public config?: ISortingConfig<TSortBy>) {
    makeAutoObservable(this)

    this.key = config?.key || undefined
    this.ascending = config?.ascending || false
  }

  // ====================================================
  // Computed
  // ====================================================
  get params(): ISortingParams<TSortBy> {
    if (!this.key) {
      return {}
    }

    return {
      sortBy: this.key,
      sortAscending: this.ascending,
    }
  }

  // ====================================================
  // Actions
  // ====================================================
  setKey = (key?: TSortBy) => {
    this.key = key
  }

  setAscending = (ascending: boolean) => {
    this.ascending = ascending
  }

  /**
   * Toggle sort directions
   */
  toggleDirection = () => {
    this.ascending = !this.ascending
  }

  /**
   * Sort by a key, swap direction if the same key is as active
   * @param key The key to sort with
   */
  sort = async (key?: TSortBy) => {
    if (key === this.key) {
      this.toggleDirection()
    } else {
      this.setAscending(this.config?.ascending || false)
    }

    this.setKey(key)

    if (this.config?.onChange) {
      this.config?.onChange()
    }
  }

  reset = () => {
    this.key = undefined
    this.ascending = this.config?.ascending || false
  }
}
