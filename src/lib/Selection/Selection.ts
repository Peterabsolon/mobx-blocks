import { ObservableMap, makeAutoObservable, observable } from "mobx"

export class Selection<TItem extends IAnyObject> {
  // ====================================================
  // Model
  // ====================================================
  selected = observable<TItem>([])

  // ====================================================
  // Constructor
  // ====================================================
  constructor() {
    makeAutoObservable(this)
  }

  // ====================================================
  // Computed
  // ====================================================
  get ids() {
    return this.selected.map((item) => item.id)
  }

  get map(): ObservableMap<string | number, TItem> {
    return new ObservableMap(this.selected.map((item) => [item.id, item]))
  }

  // ====================================================
  // Actions
  // ====================================================
  select = (item: TItem) => {
    const selected = this.selected.find((i) => i.id === item.id)
    if (selected) {
      this.selected.remove(selected)
    } else {
      this.selected.push(item)
    }
  }

  set = (items: TItem[]) => {
    this.selected.replace(items)
  }

  add = (item: TItem) => {
    this.selected.push(item)
  }

  unshift = (item: TItem) => {
    this.selected.unshift(item)
  }

  remove = (item: TItem) => {
    this.selected.remove(item)
  }

  moveItem = (from: number, to: number) => {
    this.selected.splice(to, 0, this.selected.splice(from, 1)[0])
  }

  reset = () => {
    this.selected.clear()
  }
}
