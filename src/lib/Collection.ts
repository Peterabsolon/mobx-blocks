import { makeAutoObservable, observable } from "mobx"
import debounce from "debounce-promise"

import {
  ICollectionGenerics,
  ICollectionProps,
  IFetchFnOptions,
  ISetQueryParamsFnOptions,
} from "./Collection.types"

export class Collection<IGenerics extends ICollectionGenerics> {
  // ====================================================
  // Model
  // ====================================================
  data = observable<IGenerics["data"]>([])

  fetching = false
  fetchErr?: unknown

  initialized = false

  searchQuery = ""
  searching = false

  queryParams = observable<Record<string, any>>({})

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props: ICollectionProps<IGenerics>) {
    makeAutoObservable(this, {
      props: false,
    })

    this.handleSearch = debounce(this.handleSearch, 500)
  }

  // ====================================================
  // Private
  // ====================================================
  handleSearch = async (opts: { shouldThrowError?: boolean }) => {
    const { searchFn, errorHandlerFn } = this.props
    if (!searchFn) {
      return
    }

    this.searching = true

    try {
      const data = await searchFn(this.searchQuery)
      this.data.replace(data)
    } catch (err) {
      this.fetchErr = err

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
  init = async (opts: IFetchFnOptions = {}) => {
    try {
      await this.fetch({ shouldThrowError: true })
      this.initialized = true
    } catch (err) {
      if (opts.shouldThrowError) {
        throw err
      }
    }
  }

  fetch = async (opts: IFetchFnOptions = {}) => {
    const { fetchFn, errorHandlerFn } = this.props

    this.fetching = true

    try {
      const data = await fetchFn(opts.params)
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
    }
  }

  search = async (query: string, opts: IFetchFnOptions = {}) => {
    this.searchQuery = query
    return this.handleSearch(opts)
  }

  setQueryParam = (key: string, value: any) => {
    this.queryParams[key] = value
  }

  setQueryParams = async (params: Record<string, any>, opts: ISetQueryParamsFnOptions = {}) => {
    this.queryParams = observable(opts?.merge ? { ...this.queryParams, ...params } : params)

    if (opts.fetch) {
      await this.fetch({ params: this.queryParams })
    }
  }

  clear = () => {
    this.data.clear()
    this.initialized = false
    this.fetchErr = undefined
  }
}
