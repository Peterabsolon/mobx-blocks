import { makeAutoObservable, observable, reaction } from "mobx"
import debounce from "debounce-promise"
import qs from "query-string"

import { ICollectionGenerics, ICollectionProps, IFetchFnOptions } from "./Collection.types"

export class Collection<IGenerics extends ICollectionGenerics> {
  // ====================================================
  // Model
  // ====================================================
  data = observable<IGenerics["data"]>([])
  initialized = false

  filtersMap = observable(new Map())
  searchQuery = ""

  fetching = false
  fetchErr?: unknown

  searching = false
  searchErr?: unknown

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props: ICollectionProps<IGenerics>) {
    makeAutoObservable(this, { props: false })

    this.handleSearch = debounce(this.handleSearch, 500)

    if (props.defaultFilters) {
      this.filtersMap.replace(props.defaultFilters)
    }

    if (props.syncParamsToUrl) {
      reaction(() => this.filtersMap.keys(), this.syncFetchParamsToUrl)
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get filters(): IGenerics["filters"] {
    return Object.fromEntries(this.filtersMap)
  }

  // ====================================================
  // Private
  // ====================================================
  private syncFetchParamsToUrl = () => {
    history.replaceState("", "", `${location.pathname}?${qs.stringify(this.filters)}`)
  }

  private handleSearch = async (opts: { shouldThrowError?: boolean }) => {
    const { searchFn, errorHandlerFn } = this.props
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
  fetch = async (opts: IFetchFnOptions<IGenerics["filters"]> = {}) => {
    const { fetchFn, errorHandlerFn } = this.props
    const { filters, clearFilters, query } = opts

    if (query || filters) {
      this[clearFilters ? "setFetchParams" : "mergeFetchParams"](filters || qs.parse(query || ""))
    }

    this.fetching = true

    try {
      const data = await fetchFn(this.filters)
      this.data.replace(this.data.concat(data))
    } catch (err) {
      this.fetchErr = err

      if (errorHandlerFn) {
        errorHandlerFn(err)
      }

      if (opts.shouldThrowError) {
        throw err
      }
    } finally {
      this.fetching = false
      this.initialized = true
    }
  }

  /**
   * Set fetch filters
   */
  setFetchParams = async (filters: IGenerics["filters"]) => {
    this.filtersMap.clear()
    this.filtersMap.replace(filters)
  }

  /**
   * Merge fetch filters
   */
  mergeFetchParams = async (filters: IGenerics["filters"]) => {
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
  clearFetchParam = (key: keyof IGenerics["filters"]) => {
    this.filtersMap.delete(key.toString())
  }

  /**
   * Reset fetch filters to defaults (passed in the constructor)
   */
  resetFetchParams = () => {
    this.filtersMap.replace(this.props.defaultFilters || {})
  }

  /**
   * Perform debounced search using search query and fetch filters
   */
  search = async (query: string, opts: IFetchFnOptions<IGenerics["filters"]> = {}) => {
    this.searchQuery = query
    return this.handleSearch(opts)
  }

  /**
   * Reset all state to initial
   */
  resetState = () => {
    this.data.clear()
    this.initialized = false

    this.fetching = false
    this.filtersMap.clear()
    this.fetchErr = undefined

    this.searching = false
    this.searchQuery = ""
    this.searchErr = undefined
  }
}
