// TODO: built into Collection

import { Collection } from "mobx-blocks"

export const setOrderHelper = async <TOrderDirection extends string>(
  orderBy: string,
  collection: Collection<any>,
  orderDirections: [TOrderDirection, TOrderDirection]
) => {
  const asc = orderDirections[0]
  const desc = orderDirections[1]

  let orderDirection: string | undefined = undefined

  if (orderBy === collection.orderBy) {
    orderDirection = collection.orderDirection === asc ? desc : asc
  } else {
    orderDirection = desc
  }

  await collection.fetch({
    orderBy,
    orderDirection,
  })
}
