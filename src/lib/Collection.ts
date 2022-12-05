import { makeAutoObservable, observable } from "mobx"

import { ICollectionProps, IInitFnOptions, TCollectionGenerics } from "./Collection.types"

export class Collection<IGenerics extends TCollectionGenerics> {
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
    this.fetching = true

    try {
      const data = await this.props.fetchFn()

      this.data.replace(data)
      this.initialized = true
    } catch (err) {
      this.fetchErr = err

      if (opts.shouldThrowError) {
        throw err
      }
    } finally {
      this.fetching = false
    }
  }
}
