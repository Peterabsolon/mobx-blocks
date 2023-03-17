import { configure } from "mobx"

import { Cache } from "./Cache"

configure({ safeDescriptors: false })

interface ITestItem {
  id: string
  name: string
}

const TEST_ITEMS: ITestItem[] = [
  { id: "1", name: "Foo" },
  { id: "2", name: "Bar" },
  { id: "3", name: "Baz" },
]

it("sets initial state from config", () => {
  const c = new Cache({ ttl: 1337, initialData: TEST_ITEMS })
  expect(c.ttl).toBe(1337)
  expect(c.data).toEqual(TEST_ITEMS)
})

describe("set", () => {
  it("updates and returns cached item if it exists", () => {
    const c = new Cache({ initialData: TEST_ITEMS })
    const item = c.items.get("1")
    if (!item) {
      throw new Error("Failed to get Foo")
    }

    const spy = jest.spyOn(item, "update")
    const result = c.set(TEST_ITEMS[0])
    expect(spy).toBeCalledWith(TEST_ITEMS[0])
    expect(result).toBe(item)
  })

  it("creates and returns new item if cached one does not exist", () => {
    const item = { id: "1", name: "Foo" }
    const c = new Cache<ITestItem>()
    const result = c.set(item)
    expect(result.id).toBe(item.id)
  })
})

describe("getList", () => {
  it("calls config.fetchList initially, returns cached result on second call", async () => {
    const fetchList = jest.fn().mockResolvedValue(TEST_ITEMS)
    const query = "?foo=bar"

    const c = new Cache({ fetchList })
    await c.getList(query)
    const res = await c.getList(query)

    expect(fetchList).toBeCalledTimes(1)
    expect(res).toEqual(TEST_ITEMS)
  })

  it("updates items map", async () => {
    const fetchList = jest.fn().mockResolvedValue([{ id: "1", name: "Banana" }])
    const c = new Cache({ fetchList, initialData: TEST_ITEMS })
    await c.getList()
    expect(c.readOne("1")?.name).toBe("Banana")
  })

  it("returns empty array if config.fetchList not provided", async () => {
    const c = new Cache()
    const res = await c.getList()
    expect(res).toEqual([])
  })
})

describe("getOne", () => {
  it("calls config.fetchOne initially, returns cached result on second call", async () => {
    const fetchOne = jest.fn().mockResolvedValue(TEST_ITEMS[0])
    const id = "1"

    const c = new Cache({ fetchOne })
    await c.getOne(id)
    const res = await c.getOne(id)

    expect(fetchOne).toBeCalledTimes(1)
    expect(res).toEqual(TEST_ITEMS[0])
  })

  it("updates items map", async () => {
    const fetchOne = jest.fn().mockResolvedValue({ id: "1", name: "Banana" })
    const c = new Cache({ fetchOne, initialData: TEST_ITEMS })
    await c.getOne("1", false)
    expect(c.readOne("1")?.name).toBe("Banana")
  })

  it("returns undefined if config.fetchOne not provided", async () => {
    const c = new Cache()
    const res = await c.getOne("1")
    expect(res).toEqual(undefined)
  })

  it("returns undefined if config.fetchOne returns undefined", async () => {
    const c = new Cache({ fetchOne: () => Promise.resolve(undefined) })
    const res = await c.getOne("1")
    expect(res).toEqual(undefined)
  })
})

// describe.only("getOne", () => {
//   it("returns cached result if not stale", () => {
//     const c = new Cache<ITestItem>({ initialData: TEST_ITEMS })
//     expect(c.getOne("Foo")).toBe(TEST_ITEMS[0])
//   })
// })

// describe("set", () => {
//   it("returns cached result if not stale", () => {
//     const c = new Cache<ITestItem>({ initialData: TEST_ITEMS })
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
