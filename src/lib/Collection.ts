import { makeAutoObservable, observable } from "mobx"
import debounce from "debounce-promise"

import { ICollectionProps, IInitFnOptions, ICollectionGenerics } from "./Collection.types"

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
  private handleSearch = async (opts: IInitFnOptions = {}) => {
    const { searchFn } = this.props
    if (!searchFn) {
      return
    }

    this.searching = true

    try {
      const data = await searchFn(this.searchQuery)
      this.data.replace(data)
    } catch (err) {
      this.fetchErr = err

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
  init = async (opts: IInitFnOptions = {}) => {
    try {
      await this.fetch({ shouldThrowError: true })
      this.initialized = true
    } catch (err) {
      if (opts.shouldThrowError) {
        throw err
      }
    }
  }

  fetch = async (opts: IInitFnOptions = {}) => {
    this.fetching = true

    try {
      const data = await this.props.fetchFn()
      this.data.replace(this.data.concat(data))
    } catch (err) {
      this.fetchErr = err

      if (opts.shouldThrowError) {
        throw err
      }
    } finally {
      this.fetching = false
    }
  }

  search = async (query: string) => {
    this.searchQuery = query
    return this.handleSearch()
  }

  clear = () => {
    this.data.clear()
    this.initialized = false
    this.fetchErr = undefined
  }
}
