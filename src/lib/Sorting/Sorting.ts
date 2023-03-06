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

  constructor(public props: ISortingProps) {
    makeAutoObservable(this)
  }

  get params(): ISortingParams<TSortBy> {
    if (!this.key) {
      return {}
    }

    return {
      sortBy: this.key,
      sortAscending: this.ascending,
    }
  }

  setParams = (key?: TSortBy, ascending?: boolean) => {
    this.key = key
    this.ascending = ascending || false
  }

  toggleDirection = () => {
    this.ascending = !this.ascending
  }

  setNewKey = async (key?: TSortBy) => {
    if (key === this.key) {
      this.toggleDirection()
    } else {
      this.ascending = false
    }

    this.props.onChange()
  }
}
