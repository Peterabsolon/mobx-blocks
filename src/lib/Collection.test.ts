import { Collection } from "./Collection"

interface IGenerics {
  id: string
  data: { id: string }
}

describe("Collection", () => {
  describe("init()", () => {
    it("fetches initial data, saves it to state", async () => {
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.init()

      expect(c.fetching).toBe(true)
      await fetchFn()

      expect(c.data.length).toBe(1)
      expect(c.initialized).toBe(true)
      expect(c.fetching).toBe(false)
    })

    it("swallows error, saves it to state", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const c = new Collection<IGenerics>({ fetchFn })

      try {
        c.init()
        await fetchFn()
      } catch (e) {
        expect(c.fetchErr).toBe(error)
      }
    })
  })
})
