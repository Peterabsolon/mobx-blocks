import { makeAutoObservable } from "mobx"

export interface ISortingProps {
  onChange: () => void
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

  get params() {
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
