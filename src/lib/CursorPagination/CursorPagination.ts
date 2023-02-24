import { makeAutoObservable } from "mobx"

export interface ICursorPaginationProps {
  pageSize?: number
  onChange: (pageCursor?: string) => void
}

export interface ICursorPaginationParams {
  pageCursor?: string
}

export class CursorPagination {
  // ====================================================
  // Model
  // ====================================================
  pageSize?: number = 20

  prev?: string = undefined
  current?: string = undefined
  next?: string = undefined

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props: ICursorPaginationProps) {
    makeAutoObservable(this)

    if (this.props.pageSize) {
      this.pageSize = this.props.pageSize
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get params(): ICursorPaginationParams {
    return {
      pageCursor: this.current,
    }
  }

  get hasMore(): boolean {
    if (!this.current) {
      return true
    }

    return Boolean(this.next)
  }

  // ====================================================
  // Actions
  // ====================================================
  init = (current: string) => {
    this.current = current
  }

  setNext = (next: string) => {
    this.next = next
  }

  goToNext = () => {
    this.current = this.next
    this.props.onChange(this.next)
  }

  goToPrev = () => {
    const current = this.current
    this.current = this.next
    this.next = current
  }
}
