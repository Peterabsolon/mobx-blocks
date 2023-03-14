import { Sorting } from "./Sorting"

describe("Sorting", () => {
  it("returns no params when key not set", () => {
    const s = new Sorting()
    expect(s.params).toEqual({})
  })

  it("returns params when key set", () => {
    const s = new Sorting()
    s.sort("foo")
    expect(s.params).toEqual({ sortBy: "foo", sortAscending: false })
  })

  describe("sort", () => {
    it("sets the new sort key, toggles direction when it is the same as active", () => {
      const s = new Sorting()

      s.sort("foo")
      expect(s.key).toBe("foo")
      expect(s.ascending).toBe(false)

      s.sort("foo")
      expect(s.key).toBe("foo")
      expect(s.ascending).toBe(true)
    })

    it("calls onChange", () => {
      const fn = jest.fn()
      const s = new Sorting({ onChange: fn })
      s.sort("foo")
      expect(fn).toBeCalled()
    })
  })
})
