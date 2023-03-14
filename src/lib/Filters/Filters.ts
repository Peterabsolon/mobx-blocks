import { makeAutoObservable, observable } from "mobx"

export interface IFiltersConfig<TFilters extends IAnyObject> {
  initial?: Partial<TFilters>
}

export class Filters<TFilters extends IAnyObject> {
  // ====================================================
  // Model
  // ====================================================
  active = observable(new Map())
  initial = observable(new Map())

  // ====================================================
  // Constructor
  // ====================================================
  constructor(config?: IFiltersConfig<TFilters>) {
    makeAutoObservable(this)

    if (config?.initial) {
      this.active.replace(config.initial)
      this.initial.replace(config.initial)
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get params(): Partial<TFilters> {
    return observable(Object.fromEntries(this.active))
  }

  // ====================================================
  // Actions
  // ====================================================
  set = <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    this.active.set(key, value)
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
    console.log("original reset")
    this.active.replace(this.initial)
  }
}

const filters = new Filters({ initial: { foo: "2", bar: 2 } })

filters.set("foo", "bar")
