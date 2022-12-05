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
      await c.init()

      expect(c.data.length).toBe(1)
      expect(c.initialized).toBe(true)
      expect(c.fetching).toBe(false)
    })

    it("swallows error, saves it to state", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const c = new Collection<IGenerics>({ fetchFn })

      try {
        await c.init()
      } catch (e) {
        expect(c.fetchErr).toBe(error)
      }
    })

    it("rethrows error if opts.shouldThrowError is true", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const c = new Collection<IGenerics>({ fetchFn })

      try {
        await c.init({ shouldThrowError: true })
      } catch (e) {
        expect(c.fetchErr).toBe(error)
        expect(e).toBe(error)
      }
    })
  })

  describe("fetch()", () => {
    it("fetches data, saves it to state", async () => {
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.fetch()

      expect(c.fetching).toBe(true)
      await fetchFn()

      expect(c.data.length).toBe(1)
      expect(c.fetching).toBe(false)
    })

    it("swallows error, saves it to state", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const c = new Collection<IGenerics>({ fetchFn })

      try {
        await c.fetch()
      } catch (e) {
        expect(c.fetchErr).toBe(error)
      }
    })

    it("rethrows error if opts.shouldThrowError is true", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const c = new Collection<IGenerics>({ fetchFn })

      try {
        await c.fetch({ shouldThrowError: true })
      } catch (e) {
        expect(c.fetchErr).toBe(error)
        expect(e).toBe(error)
      }
    })
  })

  describe("reset()", () => {
    it("clears data and related state", async () => {
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))
      const c = new Collection<IGenerics>({ fetchFn })

      await c.init()
      c.clear()

      expect(c.data.length).toBe(0)
      expect(c.initialized).toBe(false)
    })

    it("clears errors", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const c = new Collection<IGenerics>({ fetchFn })

      try {
        c.init()
        await fetchFn()
      } catch (e) {
        expect(c.fetchErr).toBe(error)
        c.clear()
        expect(c.fetchErr).toBe(undefined)
      }
    })
  })
})
