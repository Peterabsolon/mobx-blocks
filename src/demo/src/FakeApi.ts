import { uniqueId, times } from "lodash"

import { IProduct } from "./App.types"

const mockProduct = (index: number): IProduct => ({
  id: uniqueId(),
  name: `Product ${index}`,
})

class FakeApi {
  products = times(1000).map(mockProduct)

  getProducts = async () => {
    return this.products.slice(0, 10)
  }
}

export const api = new FakeApi()
