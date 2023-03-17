import { configure } from "mobx"

import { Cache } from "./Cache"

configure({ safeDescriptors: false })

interface IItem {
  id: string
}

const TEST_ITEMS: IItem[] = [{ id: "Foo" }, { id: "Bar" }, { id: "Baz" }]

it("sets initial state from config", () => {
  const c = new Cache<IItem>({ ttl: 1337, initialData: TEST_ITEMS })
  expect(c.ttl).toBe(1337)
  expect(c.data).toEqual(TEST_ITEMS)
})

describe("set", () => {
  it("updates cached item if it exists", () => {
    const c = new Cache<IItem>({ initialData: TEST_ITEMS })
    const item = c.readOne("Foo")
    if (!item) {
      throw new Error("Failed to get Foo")
    }

    const spy = jest.spyOn(item, "update")
    const result = c.set(TEST_ITEMS[0])
    expect(spy).toBeCalledWith(TEST_ITEMS[0])
    expect(result).toBe(item.data)
  })

  it("creates new item if cached one does not exist", () => {
    const item = { id: "Foo" }
    const c = new Cache<IItem>()
    const result = c.set(item)
    expect(result.id).toBe(item.id)
  })
})

// describe.only("getOne", () => {
//   it("returns cached result if not stale", () => {
//     const c = new Cache<IItem>({ initialData: TEST_ITEMS })
//     expect(c.getOne("Foo")).toBe(TEST_ITEMS[0])
//   })
// })

// describe("set", () => {
//   it("returns cached result if not stale", () => {
//     const c = new Cache<IItem>({ initialData: TEST_ITEMS })
//     const cached = c.getOne("Foo")

//     c.set()

//     expect(item).toBe(TEST_ITEMS[0])
//   })
// })

// inits
// read
// write
// clear
// invalidate item/query
