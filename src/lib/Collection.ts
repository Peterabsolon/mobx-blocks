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

  fetching = false
  fetchParamsMap = observable(new Map())
  fetchErr?: unknown

  searching = false
  searchQuery = ""
  searchErr?: unknown

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props: ICollectionProps<IGenerics>) {
    makeAutoObservable(this, { props: false })

    this.handleSearch = debounce(this.handleSearch, 500)

    if (props.defaultQueryParams) {
      this.fetchParamsMap.replace(props.defaultQueryParams)
    }

    if (props.syncParamsToUrl) {
      reaction(() => this.fetchParamsMap.keys(), this.syncFetchParamsToUrl)
    }
  }

  // ====================================================
  // Computed
  // ====================================================
  get fetchParams(): IGenerics["fetchParams"] {
    return Object.fromEntries(this.fetchParamsMap)
  }

  // ====================================================
  // Private
  // ====================================================
  private syncFetchParamsToUrl = () => {
    history.replaceState("", "", `${location.pathname}?${qs.stringify(this.fetchParams)}`)
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
  fetch = async (opts: IFetchFnOptions<IGenerics["fetchParams"]> = {}) => {
    const { fetchFn, errorHandlerFn } = this.props

    if (opts.params) {
      opts.clearParams ? this.setFetchParams(opts.params) : this.mergeFetchParams(opts.params)
    }

    this.fetching = true

    try {
      const data = await fetchFn(this.fetchParams)
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
   * Set fetch params
   */
  setFetchParams = async (params: IGenerics["fetchParams"]) => {
    this.fetchParamsMap.clear()
    this.fetchParamsMap.replace(params)
  }

  /**
   * Merge fetch params
   */
  mergeFetchParams = async (params: IGenerics["fetchParams"]) => {
    this.fetchParamsMap.merge(params)
  }

  /**
   * Clear all fetch params from state
   */
  clearFetchParams = () => {
    this.fetchParamsMap.clear()
  }

  /**
   * Clear specific fetch param from state
   */
  clearFetchParam = (key: keyof IGenerics["fetchParams"]) => {
    this.fetchParamsMap.delete(key.toString())
  }

  /**
   * Reset fetch params to defaults (passed in the constructor)
   */
  resetFetchParams = () => {
    this.fetchParamsMap.replace(this.props.defaultQueryParams || {})
  }

  /**
   * Perform debounced search using search query and fetch params
   */
  search = async (query: string, opts: IFetchFnOptions<IGenerics["fetchParams"]> = {}) => {
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
    this.fetchParamsMap.clear()
    this.fetchErr = undefined

    this.searching = false
    this.searchQuery = ""
    this.searchErr = undefined
  }
}
