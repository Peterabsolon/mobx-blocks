import { Filters } from "./Filters"

export {}

interface IFilters {
  foo: string
  bar: number
  baz: boolean
}

describe("Filters", () => {
  it("can set a filter", () => {
    const f = new Filters<IFilters>({})
    f.set("foo", "bar")
    expect(f.get("foo")).toBe("bar")
  })

  it("can delete a filter", () => {
    const f = new Filters<IFilters>({})
    f.set("foo", "bar")
    f.delete("foo")
    expect(f.get("foo")).toBe(undefined)
  })

  it("can merge new filters", () => {
    const params = { foo: "foo", bar: 1 }
    const f = new Filters<IFilters>({ initial: { baz: true } })
    f.merge(params)
    expect(f.params).toEqual({ ...params, baz: true })
  })

  it("can replace filters", () => {
    const params = { foo: "foo", bar: 1 }
    const f = new Filters<IFilters>({ initial: { baz: true } })
    f.replace(params)
    expect(f.params).toEqual({ ...params })
  })

  it("can reset to initial state", () => {
    const params = { foo: "foo", bar: 1 }

    const f = new Filters<IFilters>({ initial: params })
    expect(f.params).toEqual(params)

    f.clear()
    expect(f.params).toEqual({})

    f.reset()
    expect(f.params).toEqual(params)
  })
})
