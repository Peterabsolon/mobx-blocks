import { makeAutoObservable } from "mobx"

export interface ISortingProps {
  onChange: () => void
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
  ascending = false

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props: ISortingProps) {
    makeAutoObservable(this)
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
  /**
   * Set both sort key and direction
   */
  setParams = (key?: TSortBy, ascending?: boolean) => {
    this.key = key
    this.ascending = ascending || false
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
      this.ascending = false
    }

    this.props.onChange()
  }
}
