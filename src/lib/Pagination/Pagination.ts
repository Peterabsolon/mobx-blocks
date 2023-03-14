import { makeAutoObservable } from "mobx"

export interface IPaginationProps {
  page?: number
  pageSize?: number
  onChange?: (params: IPaginationParams) => void
  totalCount?: number
}

export interface IPaginationParams {
  page: number
  pageSize: number
}

export class Pagination {
  // ====================================================
  // Model
  // ====================================================
  page = 1
  pageSize = 20
  totalCount?: number

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props?: IPaginationProps) {
    makeAutoObservable(this)

    if (props?.page) this.page = props.page
    if (props?.pageSize) this.pageSize = props.pageSize
    if (props?.totalCount) this.totalCount = props.totalCount
  }

  // ====================================================
  // Computed
  // ====================================================
  get canGoToNext() {
    if (!this.totalCount) {
      return true
    }

    return this.page * this.pageSize < this.totalCount
  }

  get params(): IPaginationParams {
    return {
      page: this.page,
      pageSize: this.pageSize,
    }
  }

  // ====================================================
  // Public
  // ====================================================
  init = (page?: number, pageSize?: number) => {
    if (page) this.page = page
    if (pageSize) this.pageSize = pageSize
  }

  setTotalCount = (count: number) => {
    this.totalCount = count
  }

  setPageSize = (size: number) => {
    this.pageSize = size
  }

  goToPrev = () => {
    if (this.page > 1) {
      this.page -= 1
    }
  }

  goToNext = () => {
    const { onChange } = this.props || {}

    if (this.canGoToNext) {
      this.page += 1

      if (onChange) {
        onChange(this.params)
      }
    }
  }

  resetToInitial = () => {
    this.page = this.props?.page ?? 1
    this.pageSize = this.props?.pageSize ?? 20
    this.totalCount = this.props?.totalCount ?? 0
  }

  reset = () => {
    this.page = 1
    this.pageSize = 20
    this.totalCount = 0
  }
}
