import { makeAutoObservable, observable, reaction } from "mobx"
import debounce from "debounce-promise"
import qs from "query-string"

import {
  ICollectionConfig,
  ICollectionGenerics,
  ICollectionGenericsDefaults,
  IFetchFnOptions,
  TFetchFnResult,
} from "./Collection.types"

const PAGE_SIZE_DEFAULT = 20

export class Collection<T extends ICollectionGenerics = ICollectionGenericsDefaults> {
  // ====================================================
  // Model
  // ====================================================
  initialized = false

  data = observable<T["data"]>([])
  totalCount = 0

  filtersMap = observable(new Map())
  searchQuery = ""

  page = 1
  pageSize = PAGE_SIZE_DEFAULT
  orderBy?: T["orderBy"]
  orderAscending = false

  fetching = false
  fetchErr?: unknown

  searching = false
  searchErr?: unknown

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public config: ICollectionConfig<T>) {
    makeAutoObservable(this, { config: false })

    this.handleSearch = debounce(this.handleSearch, 500)

    if (config.pageSize) {
      this.pageSize = config.pageSize
    }

    if (config.defaultFilters) {
      this.filtersMap.replace(config.defaultFilters)
    }

    if (config.syncParamsToUrl) {
      reaction(() => this.filtersMap.keys(), this.syncFetchParamsToUrl)
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get filters(): T["filters"] {
    return Object.fromEntries(this.filtersMap)
  }

  get sorting(): { orderBy: T["orderBy"]; orderAscending: boolean } {
    return {
      orderBy: this.orderBy,
      orderAscending: this.orderAscending,
    }
  }

  get pagination(): { page?: number; pageSize?: number } {
    return {
      page: this.page,
      pageSize: this.pageSize,
    }
  }

  get queryParams(): T["filters"] & {
    orderBy: T["orderBy"]
    orderAscending: boolean
    page?: number
    pageSize?: number
  } {
    return {
      ...this.filters,
      ...this.sorting,
      ...this.pagination,
    }
  }

  // ====================================================
  // Private
  // ====================================================
  private syncFetchParamsToUrl = () => {
    history.replaceState("", "", `${location.pathname}?${qs.stringify(this.queryParams)}`)
  }

  private handleSearch = async (opts: { shouldThrowError?: boolean }) => {
    const { searchFn, errorHandlerFn } = this.config
    if (!searchFn) {
      return
    }

    this.searching = true

    try {
      const data = await searchFn(this.searchQuery)
      this.data.replace(data)
    } catch (err) {
      this.searchErr = err

      if (errorHandlerFn) {
        errorHandlerFn(err)
      }

      if (opts.shouldThrowError) {
        throw err
      }
    } finally {
      this.searching = false
    }
  }

  // ====================================================
  // Public
  // ====================================================
  /**
   * Perform fetch API request
   */
  fetch = async (opts: IFetchFnOptions<T> = {}): Promise<TFetchFnResult<T>> => {
    const { fetchFn, errorHandlerFn } = this.config
    const { clearFilters, query, orderBy, orderAscending, page, pageSize } = opts

    this.orderBy = orderBy
    this.orderAscending = orderAscending || false

    if (page) this.page = page
    if (pageSize) this.pageSize = pageSize

    const filters = query ? qs.parse(query) : opts.filters
    if (filters) {
      if (clearFilters) this.setFetchParams(filters)
      else this.mergeFetchParams(filters)
    }

    this.fetching = true

    try {
      const res = await fetchFn(this.queryParams)

      this.data.replace(res.data)
      this.totalCount = res.totalCount

      return res
    } catch (err) {
      this.fetchErr = err

      if (errorHandlerFn) {
        errorHandlerFn(err)
      }

      if (opts.shouldThrowError) {
        throw err
      }

      return { data: [], totalCount: 0 }
    } finally {
      this.fetching = false
      this.initialized = true
    }
  }

  /**
   * Performs the initial fetch, skips if initiliazed already
   */
  init = async (opts: IFetchFnOptions<T> = {}): Promise<void> => {
    if (!this.initialized) {
      await this.fetch(opts)
    }
  }

  /**
   * Set fetch filters
   */
  setFetchParams = async (filters: T["filters"]) => {
    this.filtersMap.clear()
    this.filtersMap.replace(filters)
  }

  /**
   * Merge fetch filters
   */
  mergeFetchParams = async (filters: T["filters"]) => {
    this.filtersMap.merge(filters)
  }

  /**
   * Clear all fetch filters from state
   */
  clearFetchParams = () => {
    this.filtersMap.clear()
  }

  /**
   * Clear specific fetch param from state
   */
  clearFetchParam = (key: keyof T["filters"]) => {
    this.filtersMap.delete(key.toString())
  }

  /**
   * Reset fetch filters to defaults (passed in the constructor)
   */
  resetFetchParams = () => {
    this.filtersMap.replace(this.config.defaultFilters || {})
  }

  /**
   * Perform debounced search using search query and fetch filters
   */
  search = async (query: string, opts: IFetchFnOptions<T> = {}) => {
    this.searchQuery = query
    return this.handleSearch(opts)
  }

  /**
   * Set param key to sort the data by
   */
  setOrderBy = (orderBy?: T["orderBy"]) => {
    this.orderBy = orderBy
  }

  /**
   * Set the direction to sort the data with
   */
  toggleOrderDirection = () => {
    this.orderAscending = !this.orderAscending
  }

  /**
   * Helper to either set a new orderBy key or toggle direction if it's the same
   */
  setOrderHelper = async (orderBy?: T["orderBy"]) => {
    if (orderBy === this.orderBy) {
      this.toggleOrderDirection()
    } else {
      this.orderAscending = false
    }

    await this.fetch({
      orderBy,
      orderAscending: this.orderAscending,
    })
  }

  /**
   * Reset all state to initial
   */
  resetState = () => {
    this.initialized = false

    this.data.clear()
    this.totalCount = 0

    this.filtersMap.clear()
    this.searchQuery = ""

    this.orderBy = undefined
    this.orderAscending = false
    this.page = 1
    this.pageSize = 20

    this.fetching = false
    this.fetchErr = undefined

    this.searching = false
    this.searchQuery = ""
    this.searchErr = undefined
  }
}

export const createCollection = <T extends ICollectionGenerics>(props: ICollectionConfig<T>) =>
  new Collection<T>(props)
