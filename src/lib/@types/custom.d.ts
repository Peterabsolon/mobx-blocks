interface IAnyObject {
  [key: string]: any
}

interface IObjectWithId {
  id: string | number
  [key: string]: any
}

type TAnyRecord = Record<string, any>

type TUnknownRecord = Record<string, unknown>
