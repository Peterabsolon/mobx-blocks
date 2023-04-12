// TODO: Add "excludes" "includes" etc

import { makeAutoObservable, observable, reaction } from "mobx"

export interface IFiltersConfig<TFilters extends IAnyObject> {
  initial?: Partial<TFilters>
  onChange?: (params: Partial<TFilters>) => void
}

export class Filters<TFilters extends IAnyObject> {
  // ====================================================
  // Model
  // ====================================================
  private active = observable(new Map())
  private initial = observable(new Map())

  // ====================================================
  // Constructor
  // ====================================================
  constructor(config?: IFiltersConfig<TFilters>) {
    makeAutoObservable(this)

    if (config?.initial) {
      this.active.replace(config.initial)
      this.initial.replace(config.initial)
    }

    reaction(
      () => this.params,
      (params) => {
        if (config?.onChange) {
          config.onChange(params)
        }
      }
    )
  }

  // ====================================================
  // Computed
  // ====================================================
  get params(): Partial<TFilters> {
    const lol = JSON.stringify(Object.fromEntries(this.active))

    console.log(`[blocks] lol`, lol)

    const res = observable(Object.fromEntries(this.active))

    console.log(`[blocks] params`, res)

    return res
  }

  // ====================================================
  // Actions
  // ====================================================
  get = <K extends keyof TFilters>(key: K) => {
    return this.active.get(key)
  }

  set = <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    this.active.set(key, value)

    console.log(`[blocks] after setting`, this.active)
  }

  merge = (filters: Partial<TFilters>) => {
    this.active.merge(filters)
  }

  replace = (filters: Partial<TFilters>) => {
    this.active.replace(filters)
  }

  delete = (key: keyof TFilters) => {
    this.active.delete(key)
  }

  clear = () => {
    this.active.clear()
  }

  reset = () => {
    this.active.replace(this.initial)
  }
}
