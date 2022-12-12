import { Collection } from "../lib"

interface IProudct {
  id: string
}

type TOrderBy = "id" | "name"

type TOrderDirection = "asc" | "desc"

const collection = new Collection<{
  id: string
  data: IProudct
  filters: never
  orderBy: TOrderBy
  orderDirection: TOrderDirection
}>({
  fetchFn: () => Promise.resolve([]),
})

console.log("collection", collection)
