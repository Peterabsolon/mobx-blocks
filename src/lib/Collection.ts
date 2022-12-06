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
  initialized = false

  fetching = false
  fetchErr?: unknown
  fetchParams = observable<IGenerics["fetchParams"]>({})

  searchQuery = ""
  searching = false
  searchErr?: unknown

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
  init = async (opts: IFetchFnOptions<IGenerics["fetchParams"]> = {}) => {
    try {
      await this.fetch({ shouldThrowError: true })
      this.initialized = true
    } catch (err) {
      if (opts.shouldThrowError) {
        throw err
      }
    }
  }

  fetch = async (opts: IFetchFnOptions<IGenerics["fetchParams"]> = {}) => {
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

  setFetchParam = (key: keyof IGenerics["fetchParams"], value: any) => {
    this.fetchParams[key] = value
  }

  clearFetchParam = (key: keyof IGenerics["fetchParams"]) => {
    delete this.fetchParams[key]
  }

  setFetchParams = async (
    params: IGenerics["fetchParams"],
    opts: ISetQueryParamsFnOptions = {}
  ) => {
    this.fetchParams = observable(opts?.merge ? { ...this.fetchParams, ...params } : params)

    if (opts.fetch) {
      await this.fetch({ params: this.fetchParams })
    }
  }

  search = async (query: string, opts: IFetchFnOptions<IGenerics["fetchParams"]> = {}) => {
    this.searchQuery = query
    return this.handleSearch(opts)
  }

  clear = () => {
    this.data.clear()
    this.initialized = false

    this.fetching = false
    this.fetchErr = undefined
    this.fetchParams = observable<Record<string, any>>({})

    this.searchQuery = ""
    this.searching = false
    this.searchErr = undefined
  }
}
