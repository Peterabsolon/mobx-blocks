import { Collection } from "../lib"

const collection = new Collection()

const body = document.querySelector("body")
if (body) {
  body.innerHTML = `<h1>Hello World!</h1>`
}

console.log("collection", collection)
