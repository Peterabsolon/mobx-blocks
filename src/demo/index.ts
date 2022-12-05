import MyLibrary from "../lib"

const myLibraryInstance = new MyLibrary()

const body = document.querySelector("body")
if (body) body.innerHTML = `<h1>Hello World!</h1>`

console.log("myLibraryInstance", myLibraryInstance)

myLibraryInstance.myMethod()
