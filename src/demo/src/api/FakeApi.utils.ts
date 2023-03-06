import { uniqueId } from "lodash"
import { faker } from "@faker-js/faker"

import type { IProduct } from "../Products/Products.types"
import type { IUser } from "../Users/Users.types"

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockProduct = (index: number): IProduct => {
  const adjective = faker.word.adjective()
  const adjectiveOther = faker.word.adjective()
  const name = faker.commerce.product()

  return {
    id: uniqueId(),
    name: `${adjective} ${adjectiveOther} ${name}`,
  }
}

export const mockUser = (index: number): IUser => ({
  id: uniqueId(),
  name: faker.name.fullName(),
})

export const isFuzzyMatch = (a?: string | number, b?: string | number) =>
  String(a)
    ?.toLowerCase()
    .includes(String(b)?.toLowerCase() || "")
