interface IAnyObject {
  [key: string]: any
}

type TAnyRecord = Record<string, any>

interface IObjectWithId extends IAnyObject {
  id: string
}
