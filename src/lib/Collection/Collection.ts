import { makeAutoObservable, observable, reaction, runInAction } from "mobx"
import debounce from "debounce-promise"
import qs from "query-string"

import { ICollectionConfig, IFetchFnCursorOptions, IFetchFnOptions } from "./Collection.types"
import { Pagination } from "../Pagination"
import { CursorPagination } from "../CursorPagination"
import { Sorting } from "../Sorting"
import { Filters } from "../Filters"

export class Collection<
  TItem,
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
   * Has fetched some data
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
      onChange: () => this.fetch(),
    })

    this.filters = new Filters<TFilters>({ initial: config.initialFilters })

    this.pagination = new Pagination({
      pageSize: this.config.pageSize,
      onChange: () => this.fetch(),
    })

    this.cursorPagination = new CursorPagination({
      pageSize: this.config.pageSize,
      onChange: (params) => this.fetch(params as IFetchFnOptions<TFilters, TSortBy>),
    })

    if (config.syncParamsToUrl) {
      reaction(() => this.filters.params, this.syncFetchParamsToUrl)
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

    return {
      ...this.queryParamsWithoutPagination,
    }
  }

  // ====================================================
  // Private methods
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
  // Public methods
  // ====================================================
  /**
   * Perform fetch API request
   */
  fetch = async (
    opts: TPagination extends CursorPagination
      ? IFetchFnCursorOptions<TFilters, TSortBy>
      : IFetchFnOptions<TFilters, TSortBy> = {}
  ) => {
    const { fetchFn, errorHandlerFn } = this.config
    const { clearFilters, query, sortBy, sortAscending, page, pageSize, pageCursor } = opts

    if (pageCursor && typeof this.config.pagination !== typeof CursorPagination) {
      console.warn('"pageCursor" param passed but CursorPagination not initialized')
    }

    /**
     * Sorting
     */
    this.sorting.setParams(sortBy, sortAscending)

    /**
     * Pagination
     */
    this.pagination.init(page, pageSize)
    this.cursorPagination.init(pageCursor, pageSize)

    /**
     * Filters
     */
    const filters = query ? qs.parse(query) : opts.filters
    if (filters) {
      if (clearFilters) this.filters.clear()
      this.filters.merge(filters as TFilters)
    }

    this.fetching = true

    return runInAction(async () => {
      try {
        // TODO: remove any
        const res = await fetchFn(this.queryParams as any)

        this.data.replace(res.data)

        if ("totalCount" in res) {
          this.pagination?.setTotalCount(res.totalCount)
        }

        if (this.cursorPagination && "totalCount" in res) {
          this.cursorPagination.setTotalCount(res.totalCount)
        }

        if (this.cursorPagination && "nextPageCursor" in res && res.nextPageCursor) {
          this.cursorPagination.setNext(res.nextPageCursor)
        }

        if (this.cursorPagination && "prevPageCursor" in res && res.prevPageCursor) {
          this.cursorPagination.setPrev(res.prevPageCursor)
        }

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
    })
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
   * Reset all state to initial
   */
  resetState = () => {
    // TODO: Reset all blocks
    // this.sorting.reset()
    // this.cursorPagination.reset()
    this.filters.reset()
    this.pagination.reset()

    this.data.clear()

    this.initialized = false
    this.fetching = false
    this.fetchErr = undefined

    this.searchQuery = ""
    this.searching = false
    this.searchErr = undefined
  }
}

// export const createCollection = <T extends ICollectionGenerics>(props: ICollectionConfig<T>) =>
//   new Collection<T>(props)
