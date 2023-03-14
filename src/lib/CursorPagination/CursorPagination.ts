import { makeAutoObservable, runInAction } from "mobx"

export interface ICursorPaginationProps {
  pageSize?: number
  onChange?: (params: ICursorPaginationParams) => void
}

export interface ICursorPaginationParams {
  pageCursor: string | null
  pageSize: number
}

export class CursorPagination {
  // ====================================================
  // Model
  // ====================================================
  page = 1
  pageSize = 20
  totalCount?: number

  prev: string | null = null
  current: string | null = null
  next: string | null = null

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props?: ICursorPaginationProps) {
    makeAutoObservable(this)

    if (this.props?.pageSize) {
      this.pageSize = this.props.pageSize
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get params(): ICursorPaginationParams {
    return {
      pageCursor: this.current,
      pageSize: this.pageSize,
    }
  }

  get canGoToPrev(): boolean {
    return Boolean(this.prev)
  }

  get canGoToNext(): boolean {
    return Boolean(this.next)
  }

  // ====================================================
  // Actions
  // ====================================================
  init = (current?: string | null, pageSize?: number) => {
    this.setCurrent(current)
    if (pageSize) this.pageSize = pageSize
  }

  setCurrent = (current?: string | null) => {
    this.current = current || null
  }

  setNext = (next: string | null) => {
    this.next = next
  }

  setPrev = (prev: string | null) => {
    this.prev = prev
  }

  setTotalCount = (totalCount: number) => {
    this.totalCount = totalCount
  }

  setPageSize = (size: number) => {
    this.pageSize = size
  }

  goToNext = () => {
    if (!this.canGoToNext) {
      return
    }

    this.setPrev(this.current)
    this.setCurrent(this.next)
    this.page += 1

    runInAction(() => {
      if (this.props?.onChange) {
        this.props.onChange(this.params)
      }
    })
  }

  goToPrev = () => {
    if (!this.canGoToPrev) {
      return
    }

    const current = this.current
    this.setCurrent(this.prev)
    this.setNext(current)
    this.page -= 1

    runInAction(() => {
      if (this.props?.onChange) {
        this.props.onChange(this.params)
      }
    })
  }
}
