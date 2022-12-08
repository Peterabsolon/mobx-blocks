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
  fetchParams = observable<IGenerics["fetchParams"]>({})
  fetchParamsDefaults = observable<IGenerics["fetchParams"]>({})
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
      this.fetchParams = observable(props.defaultQueryParams)
      this.fetchParamsDefaults = observable(props.defaultQueryParams)
    }

    if (props.syncParamsToUrl) {
      reaction(() => this.fetchParams, this.syncFetchParamsToUrl)
    }
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
    this.fetchParams = observable(params)
  }

  /**
   * Merge fetch params
   */
  mergeFetchParams = async (params: IGenerics["fetchParams"]) => {
    this.fetchParams = observable({ ...this.fetchParams, ...params })
  }

  /**
   * Clear all fetch params from state
   */
  clearFetchParams = () => {
    this.fetchParams = observable<Record<string, any>>({})
  }

  /**
   * Clear specific fetch param from state
   */
  clearFetchParam = (key: keyof IGenerics["fetchParams"]) => {
    delete this.fetchParams[key]
  }

  /**
   * Reset fetch params to defaults (passed in the constructor)
   */
  resetFetchParams = () => {
    this.setFetchParams(this.fetchParamsDefaults)
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
    this.fetchParams = observable<Record<string, any>>({})
    this.fetchErr = undefined

    this.searching = false
    this.searchQuery = ""
    this.searchErr = undefined
  }
}
