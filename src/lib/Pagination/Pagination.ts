import { makeAutoObservable } from "mobx"

export interface IPaginationConfig {
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
  constructor(public config?: IPaginationConfig) {
    makeAutoObservable(this)

    if (config?.page) this.page = config.page
    if (config?.pageSize) this.pageSize = config.pageSize
    if (config?.totalCount) this.totalCount = config.totalCount
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
    const { onChange } = this.config || {}

    if (this.canGoToNext) {
      this.page += 1

      if (onChange) {
        onChange(this.params)
      }
    }
  }

  resetToInitial = () => {
    this.page = this.config?.page ?? 1
    this.pageSize = this.config?.pageSize ?? 20
    this.totalCount = this.config?.totalCount ?? 0
  }

  reset = () => {
    this.page = 1
    this.pageSize = 20
    this.totalCount = 0
  }
}
