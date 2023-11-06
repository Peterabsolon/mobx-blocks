import { ObservableMap, makeAutoObservable, observable, reaction } from "mobx"
import debounce from "debounce-promise"
import qs from "query-string"
import { merge } from "lodash"

import { Pagination } from "../Pagination"
import { CursorPagination } from "../CursorPagination"
import { Sorting } from "../Sorting"
import { Filters } from "../Filters"

import { ICollectionConfig, IFetchFnCursorOptions, IFetchFnOptions } from "./Collection.types"
import { Selection } from "../Selection"
import { parseQueryString } from "./Collection.utils"

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
   * TODO: Docs
   */
  meta = observable({})

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
  cursorPagination: CursorPagination
  filters: Filters<TFilters>
  pagination: Pagination
  selection: Selection<TItem>
  sorting: Sorting<TSortBy>

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public config: ICollectionConfig<TItem, TFilters, TSortBy, TPagination>) {
    makeAutoObservable(this, { config: false })

    this.handleSearch = debounce(this.handleSearch, 500)

    this.selection = new Selection<TItem>()

    this.sorting = new Sorting<TSortBy>({
      onChange: () => this.handleFetch(),
      ascending: config.sortAscending,
      key: config.sortBy,
    })

    this.filters = new Filters<TFilters>({
      onChange: () => this.handleFetch(),
      initial: config.initialFilters,
    })

    this.pagination = new Pagination({
      onChange: () => this.handleFetch(),
      pageSize: config.pageSize,
    })

    this.cursorPagination = new CursorPagination({
      onChange: () => this.handleFetch(),
      pageSize: config.pageSize,
    })

    if (config.syncParamsToUrl) {
      reaction(() => this.queryParams, this.syncQueryParamsToUrl)
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get map(): ObservableMap<string | number, TItem> {
    return new ObservableMap(this.data.map((item) => [item.id, item]))
  }

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
    return qs.stringify(this.queryParams, { encode: false })
  }

  // ====================================================
  // Private
  // ====================================================
  private syncQueryParamsToUrl = () => {
    history.replaceState("", "", `${location.pathname}?${this.queryString.replace("?", "")}`)
  }

  private handleSearch = async (opts?: {
    shouldThrowError?: boolean
    append?: boolean
    clearFilters?: boolean
  }) => {
    const { searchFn, errorHandlerFn, cache } = this.config
    if (!searchFn) {
      return
    }

    this.searching = true

    if (opts?.clearFilters) {
      this.filters.clear()
      this.pagination.reset()
      this.cursorPagination.reset()
      this.sorting.reset()
    }

    try {
      if (!this.config.preserveSelectedOnSearch) {
        this.selection.reset()
      }

      const data = await searchFn(this.searchQuery, this.filters.params as TFilters)

      if (opts?.append) {
        this.data.replace(this.data.concat(data))
      } else if (this.config.preserveSelectedOnSearch) {
        this.data.replace(this.selection.selected.concat(data))
      } else {
        this.data.replace(data)
      }

      if (cache) {
        cache.saveQuery(this.queryString, data)
      }

      this.savePaginationState({ totalCount: data.length })
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

  private handleFetch = async (opts?: { shouldThrowError?: boolean; append?: boolean }) => {
    const { fetchFn, errorHandlerFn, cache } = this.config

    this.fetching = true

    try {
      if (cache) {
        const cached = cache.getQuery(this.queryString)
        if (cached && !cached.isStale(new Date())) {
          this.data.replace((opts?.append ? this.data.concat(cached.data) : cached.data) as TItem[])
          this.savePaginationState(cached)

          return {
            data: cached.data,
            totalCount: cached.totalCount,
          }
        }
      }

      // TODO: remove any
      const res = await fetchFn(this.queryParams as any)

      this.data.replace(opts?.append ? this.data.concat(res.data) : res.data)

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
    if (state.totalCount || state.totalCount === 0) {
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
   * Fetches data from your API and saves data to collection
   */
  fetch = async (
    opts: TPagination extends CursorPagination
      ? IFetchFnCursorOptions<TFilters, TSortBy>
      : IFetchFnOptions<TFilters, TSortBy> = {}
  ) => {
    const { page, pageCursor, pageSize, sortBy, sortAscending, clearFilters, filters = {} } = opts

    if (clearFilters) {
      this.filters.clear()
      this.pagination.reset()
      this.cursorPagination.reset()
      this.sorting.reset()
    }

    if (sortBy) {
      this.sorting.setKey(sortBy)
    }

    if (typeof sortAscending !== "undefined") {
      this.sorting.setAscending(sortAscending)
    }

    if (Object.keys(filters).length > 0) {
      this.filters.merge(filters)
    }

    if (page) {
      this.pagination.setPage(page)
    }

    if (pageSize) {
      this.pagination.setPageSize(pageSize)
      this.cursorPagination.setPageSize(pageSize)
    }

    if (pageCursor) {
      this.cursorPagination.setCurrent(pageCursor)
    }

    return this.handleFetch(opts)
  }

  /**
   * TODO
   */
  fetchOne = async (
    id: string | number,
    opts?: { useCache?: boolean; append?: boolean; prepend?: boolean }
  ): Promise<TItem | undefined> => {
    const { cache } = this.config

    if (cache && opts?.useCache) {
      const item = cache.get(id)
      if (item && !item.isStale(new Date())) {
        return item.data as TItem
      }
    }

    if (!this.config.fetchOneFn) {
      return undefined
    }

    const item = await this.config.fetchOneFn(id)
    if (item) {
      if (cache) {
        cache.save(item)
      }

      if (opts?.append) {
        this.data.push(item)
      } else if (opts?.prepend) {
        this.data.unshift(item)
      }
    }

    return item
  }

  /**
   * Perform debounced search request
   */
  search = async (query: string, opts: IFetchFnOptions<TFilters, TSortBy> = {}) => {
    this.searchQuery = query

    if (!this.config.preserveSelectedOnSearch) {
      this.selection.reset()
    }

    return this.handleSearch(opts)
  }

  /**
   * Performs edit request, updates data & cache
   */
  edit = async (id: string | number, updates: Omit<Partial<TItem>, "id">) => {
    const { editFn, cache } = this.config

    if (!editFn) {
      return undefined
    }

    const updatedItem = await editFn(id, updates)
    if (!updatedItem) {
      return undefined
    }

    if (cache) {
      cache.save(updatedItem)
    }

    const index = this.data.findIndex((item) => item.id === id)
    if (index > -1) {
      this.data[index] = updatedItem
    }

    return updatedItem
  }

  /**
   * TODO: Docs
   * TODO: Add opts.merge: boolean
   */
  addItem = (item: TItem) => {
    if (this.config.cache) {
      this.config.cache.save(item)
    }

    const existingIndex = this.data.findIndex((i) => i.id === item.id)
    if (existingIndex > -1) {
      this.data[existingIndex] = merge(this.data[existingIndex], item)
      return
    }

    this.data.push(item)
  }

  /**
   * Swaps two items from/to indexes
   */
  moveItem = (from: number, to: number) => {
    this.data.splice(to, 0, this.data.splice(from, 1)[0])
  }

  /**
   * TODO: Docs
   */
  removeItem = (item: TItem) => {
    // Delete data from this collection
    this.data.replace(this.data.filter((x) => x.id !== item.id))

    // Update pagination state
    this.pagination.setTotalCount((this.pagination.totalCount || 1) - 1)

    // Go page back if deleted as last item on this page
    if (this.data.length === 0) {
      this.pagination.goToPrev()
    }

    // Invalidate cache
    if (this.config.cache) {
      this.config.cache.clear()
    }
  }

  configure = (config: ICollectionConfig<TItem, TFilters, TSortBy, TPagination>) => {
    this.config.preserveSelectedOnSearch = config.preserveSelectedOnSearch
  }

  // ====================================================
  // Lifecycle
  // ====================================================
  /**
   * Performs the initial fetch, parses query string if passed
   */
  init = async (opts: IFetchFnOptions<TFilters, TSortBy> = {}): Promise<void> => {
    if (this.fetching) return
    const parsedQuery = parseQueryString<TSortBy, TFilters>(opts.query)
    await this.fetch({ ...parsedQuery, ...opts })
  }

  /**
   * Resets all state to initial
   */
  resetState = () => {
    this.data.clear()

    this.cursorPagination.reset()
    this.filters.reset()
    this.pagination.reset()
    this.selection.reset()
    this.sorting.reset()

    this.initialized = false
    this.fetching = false
    this.fetchErr = undefined

    this.searchQuery = ""
    this.searching = false
    this.searchErr = undefined
  }
}
