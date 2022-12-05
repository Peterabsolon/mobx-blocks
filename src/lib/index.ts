export class Collection {
  constructor() {
    console.log("Library constructor loaded")
  }

  myMethod = (): boolean => {
    console.log("Library method fired")
    return true
  }
}
