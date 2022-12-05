import { Collection } from "../lib"

const collection = new Collection({ fetchFn: () => Promise.resolve([]) })

console.log("collection", collection)
