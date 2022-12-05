import { makeAutoObservable, observable } from "mobx"

import { ICollectionProps, IInitFnOptions, ICollectionGenerics } from "./Collection.types"

export class Collection<IGenerics extends ICollectionGenerics> {
  // ====================================================
  // Model
  // ====================================================
  data = observable<IGenerics["data"]>([])
  fetching = false
  fetchErr?: unknown
  initialized = false

  // ====================================================
  // Constructor
  // ====================================================
  constructor(public props: ICollectionProps<IGenerics>) {
    makeAutoObservable(this, {
      props: false,
    })
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
      this.data.replace(data)
    } catch (err) {
      this.fetchErr = err

      if (opts.shouldThrowError) {
        throw err
      }
    } finally {
      this.fetching = false
    }
  }

  clear = () => {
    this.data.clear()
    this.initialized = false
    this.fetchErr = undefined
  }
}
