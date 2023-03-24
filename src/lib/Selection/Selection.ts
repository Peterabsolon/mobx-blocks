import { makeAutoObservable, observable } from "mobx"

export class Selection<TItem extends IObjectWithId> {
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

  reset = () => {
    this.selected.clear()
  }
}
