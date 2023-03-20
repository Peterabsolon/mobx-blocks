import { makeAutoObservable, observable, reaction } from "mobx"
import debounce from "debounce-promise"
import qs from "query-string"

import { Pagination } from "../Pagination"
import { CursorPagination } from "../CursorPagination"
import { Sorting } from "../Sorting"
import { Filters } from "../Filters"

import { ICollectionConfig, IFetchFnCursorOptions, IFetchFnOptions } from "./Collection.types"

export class Collection<
  TItem extends IObjectWithId,
  TFilters extends Record<string, any>,
  TSortBy extends string,
  TPagination extends typeof Pagination | typeof CursorPagination | undefined
> {
  // ====================================================
  // Model
  // ====================================================
  /**
   * The data
   */
  data = observable<TItem>([])

  /**
   * Has fetched some data?
   */
  initialized = false

  /**
   * Is fetching data?
   */
  fetching = false

  /**
   * Error thrown from this.fetch
   */
  fetchErr?: unknown

  /**
   * Main search input query string
   */
  searchQuery = ""

  /**
   * Is search request ongoing?
   */
  searching = false

  /**
   * Error thrown from this.search
   */
  searchErr?: unknown

  // ====================================================
  // Blocks
  // ====================================================
  sorting: Sorting<TSortBy>
  filters: Filters<TFilters>
  pagination: Pagination
  cursorPagination: CursorPagination

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public config: ICollectionConfig<TItem, TFilters, TSortBy, TPagination>) {
    makeAutoObservable(this, { config: false })

    this.handleSearch = debounce(this.handleSearch, 500)

    this.sorting = new Sorting<TSortBy>({
      onChange: () => this.handleFetch(),
    })

    this.filters = new Filters<TFilters>({
      onChange: () => this.handleFetch(),
      initial: config.initialFilters,
    })

    this.pagination = new Pagination({
      onChange: () => this.handleFetch(),
      pageSize: this.config.pageSize,
    })

    this.cursorPagination = new CursorPagination({
      onChange: () => this.handleFetch(),
      pageSize: this.config.pageSize,
    })

    if (config.syncParamsToUrl) {
      reaction(() => this.filters.params, this.syncQueryParamsToUrl)
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get queryParamsWithoutPagination() {
    return {
      ...this.filters.params,
      ...this.sorting.params,
    }
  }

  get queryParams() {
    if (this.config.pagination === Pagination) {
      return {
        ...this.queryParamsWithoutPagination,
        ...this.pagination.params,
      }
    }

    if (this.config.pagination === CursorPagination) {
      return {
        ...this.queryParamsWithoutPagination,
        ...this.cursorPagination.params,
      }
    }

    return this.queryParamsWithoutPagination
  }

  get queryString(): string {
    return qs.stringify(this.queryParams)
  }

  // ====================================================
  // Private methods
  // ====================================================
  private syncQueryParamsToUrl = () => {
    history.replaceState("", "", `${location.pathname}?${qs.stringify(this.queryParams)}`)
  }

  private handleSearch = async (opts?: { shouldThrowError?: boolean }) => {
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

      if (opts?.shouldThrowError) {
        throw err
      }
    } finally {
      this.searching = false
    }
  }

  private handleFetch = async (opts?: { shouldThrowError?: boolean }) => {
    const { fetchFn, errorHandlerFn, cache } = this.config

    this.fetching = true

    try {
      if (cache) {
        const cached = cache.readQuery(this.queryString)
        if (cached && !cached.isStale(new Date())) {
          this.data.replace(cached.data)
          this.savePaginationState(cached)

          return {
            data: cached.data,
            totalCount: cached.totalCount,
          }
        }
      }

      // TODO: remove any
      const res = await fetchFn(this.queryParams as any)
      this.data.replace(res.data)

      if (cache) {
        cache.saveQuery(this.queryString, res.data, res)
      }

      this.savePaginationState(res)

      return res
    } catch (err) {
      this.fetchErr = err

      if (errorHandlerFn) {
        errorHandlerFn(err)
      }

      if (opts?.shouldThrowError) {
        throw err
      }

      return { data: [], totalCount: 0 }
    } finally {
      this.fetching = false
      this.initialized = true
    }
  }

  private savePaginationState = (state: {
    pageCursor?: string | null
    prevPageCursor?: string | null
    nextPageCursor?: string | null
    totalCount?: number
  }) => {
    if (state.totalCount) {
      this.pagination.setTotalCount(state.totalCount)
      this.cursorPagination.setTotalCount(state.totalCount)
    }

    if (state.pageCursor) {
      this.cursorPagination.setCurrent(state.pageCursor)
    }

    if (state.prevPageCursor) {
      this.cursorPagination.setPrev(state.prevPageCursor)
    }

    if (state.nextPageCursor) {
      this.cursorPagination.setNext(state.nextPageCursor)
    }
  }

  // ====================================================
  // Public methods
  // ====================================================
  /**
   * Fetches data from your API and save data to collection
   */
  fetch = async (
    opts: TPagination extends CursorPagination
      ? IFetchFnCursorOptions<TFilters, TSortBy>
      : IFetchFnOptions<TFilters, TSortBy> = {}
  ) => {
    const { clearFilters, query, sortBy, sortAscending, page, pageSize, pageCursor } = opts

    this.sorting.setParams(sortBy, sortAscending)
    this.pagination.init(page, pageSize)
    this.cursorPagination.init(pageCursor, pageSize)

    const filters = query ? qs.parse(query) : opts.filters
    if (filters) {
      if (clearFilters) this.filters.clear()
      this.filters.merge(filters as TFilters)
    }

    return this.handleFetch(opts)
  }

  /**
   * TODO
   */
  fetchOne = async (
    id: string | number,
    opts?: { useCache?: boolean }
  ): Promise<TItem | undefined> => {
    const { cache } = this.config

    if (cache && opts?.useCache) {
      const item = cache.readOne(id)
      if (item && !item.isStale(new Date())) {
        return item.data
      }
    }

    if (!this.config.fetchOneFn) {
      // TODO: Warn
      return
    }

    const data = await this.config.fetchOneFn(id)

    if (cache && data) {
      const cachedItem = cache.saveOne(data)
      return cachedItem.data
    }

    return data
  }

  /**
   * Perform debounced search using search query and fetch filters
   */
  search = async (query: string, opts: IFetchFnOptions<TFilters, TSortBy> = {}) => {
    this.searchQuery = query
    return this.handleSearch(opts)
  }

  // ====================================================
  // Lifecycle
  // ====================================================
  /**
   * Performs the initial fetch, skips if initiliazed already
   */
  init = async (opts: IFetchFnOptions<TFilters, TSortBy> = {}): Promise<void> => {
    if (!this.initialized) {
      await this.fetch(opts)
    }
  }

  /**
   * Resets all state to initial
   */
  resetState = () => {
    this.data.clear()

    // TODO: Reset all blocks
    // this.sorting.reset()
    this.filters.reset()
    this.cursorPagination.reset()
    this.pagination.reset()

    this.initialized = false
    this.fetching = false
    this.fetchErr = undefined

    this.searchQuery = ""
    this.searching = false
    this.searchErr = undefined
  }
}
