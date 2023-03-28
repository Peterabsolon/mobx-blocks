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
  totalCount?: number = undefined

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
    if (this.totalCount === undefined) {
      return true
    }

    return this.page * this.pageSize < this.totalCount
  }

  canGoToPage = (page: number) => {
    if (this.totalCount === undefined) {
      return true
    }

    const count = page * this.pageSize

    return this.page > 0 && count <= this.totalCount
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
  setPage = (page: number) => {
    this.page = page
  }

  setTotalCount = (count: number) => {
    this.totalCount = count
  }

  setPageSize = (size: number) => {
    this.pageSize = size
  }

  onChange = () => {
    if (this.config?.onChange) {
      this.config.onChange(this.params)
    }
  }

  /**
   * Set the page, trigger onChange
   */
  goToPage = (page: number) => {
    if (this.canGoToPage(page)) {
      this.setPage(page)
      this.onChange()
    }
  }

  /**
   * Go to previous page, trigger onChange
   */
  goToPrev = () => {
    if (this.page > 1) {
      this.page -= 1
      this.onChange()
    }
  }

  /**
   * Go to next page, trigger onChange
   */
  goToNext = () => {
    if (this.canGoToNext) {
      this.page += 1
      this.onChange()
    }
  }

  /**
   * Reset state to initial passed through constructor
   */
  resetToInitial = () => {
    this.page = this.config?.page ?? 1
    this.pageSize = this.config?.pageSize ?? 20
    this.totalCount = this.config?.totalCount ?? undefined
  }

  /**
   * Completely reset state
   */
  reset = () => {
    this.page = 1
    this.pageSize = 20
    this.totalCount = undefined
  }
}
