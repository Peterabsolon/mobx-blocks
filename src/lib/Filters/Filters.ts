import { makeAutoObservable, observable } from "mobx"

export interface IFiltersConfig<TFilters extends IAnyObject> {
  initialFilters?: Partial<TFilters>
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
  constructor(public config?: IFiltersConfig<TFilters>) {
    makeAutoObservable(this)
  }

  // ====================================================
  // Computed
  // ====================================================
  get params(): Partial<TFilters> {
    return Object.fromEntries(this.active)
  }

  // ====================================================
  // Actions
  // ====================================================
  set = <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    this.active.set(key, value)
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

const filters = new Filters({ initialFilters: { foo: "2", bar: 2 } })

filters.set("foo", "bar")
