import { Collection } from "./Collection"

interface IGenerics {
  id: string
  data: { id: string }
}

describe("Collection", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

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

      await c.init()
      expect(c.fetchErr).toBe(error)
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

    it("calls props.errorHandlerFn() if passed on error", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const errorHandlerFn = jest.fn()

      const c = new Collection<IGenerics>({ fetchFn, errorHandlerFn })
      await c.init()

      expect(errorHandlerFn).toBeCalledWith(error)
    })
  })

  describe("fetch()", () => {
    it("performs fetch API request, saves data to state", async () => {
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.fetch()

      expect(c.fetching).toBe(true)
      await fetchFn()

      expect(c.data.length).toBe(1)
      expect(c.fetching).toBe(false)
    })

    it("performs fetch API request with passed in query params", async () => {
      const params = { foo: "bar" }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      await c.fetch({ params })

      expect(fetchFn).toBeCalledWith(params)
    })

    it("catches error, saves it to state", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))

      const c = new Collection<IGenerics>({ fetchFn })
      await c.fetch()

      expect(c.fetchErr).toBe(error)
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

    it("calls props.errorHandlerFn() if passed on error", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const errorHandlerFn = jest.fn()

      const c = new Collection<IGenerics>({ fetchFn, errorHandlerFn })
      await c.fetch()

      expect(errorHandlerFn).toBeCalledWith(error)
    })

    it("appends new data to exisitng", async () => {
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      await c.fetch()
      expect(c.data.length).toBe(1)

      await c.fetch()
      expect(c.data.length).toBe(2)
    })
  })

  describe("search()", () => {
    it("performs search API request, replaces results", async () => {
      // use fake timers so workaround debounce
      jest.useFakeTimers()

      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))
      const searchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn, searchFn })
      c.search("someQuery")

      // Fast-forward time
      jest.runAllTimers()
      expect(c.searching).toBe(true)

      await searchFn()
      expect(c.data.length).toBe(1)
      expect(c.searching).toBe(false)

      // check data was replaced, not appended
      c.search("someOtherQuery")
      await searchFn()
      expect(c.data.length).toBe(1)
    })

    it("does nothing when searchFn not passed", async () => {
      jest.useFakeTimers()

      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))
      const c = new Collection<IGenerics>({ fetchFn })

      const promise = c.search("someQuery")
      jest.runAllTimers()
      await promise

      expect(c.searching).toBe(false)
    })

    it("debounces search, uses last search query", async () => {
      jest.useFakeTimers()

      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))
      const searchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn, searchFn })
      c.search("someQuery")
      c.search("someOtherQuery")

      const promise = c.search("someThirdQuery")
      jest.runAllTimers()
      await promise

      expect(searchFn).toBeCalledWith("someThirdQuery")
      expect(searchFn).toBeCalledTimes(1)
    })

    it("catches error, saves it to state", async () => {
      jest.useFakeTimers()

      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const searchFn = jest.fn(() => Promise.reject(error))

      const c = new Collection<IGenerics>({ fetchFn, searchFn })

      try {
        const promise = c.search("someQuery")
        jest.runAllTimers()
        await promise
      } catch (e) {
        expect(c.fetchErr).toBe(error)
      }
    })

    it("rethrows error if opts.shouldThrowError is true", async () => {
      jest.useFakeTimers()

      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const searchFn = jest.fn(() => Promise.reject(error))

      const c = new Collection<IGenerics>({ fetchFn, searchFn })

      try {
        const promise = c.search("someQuery", { shouldThrowError: true })
        jest.runAllTimers()
        await promise
      } catch (e) {
        expect(e).toBe(error)
        expect(c.fetchErr).toBe(error)
      }
    })

    it("calls props.errorHandlerFn() if passed on error", async () => {
      const error = new Error("Foo")
      const searchFn = jest.fn(() => Promise.reject(error))
      const fetchFn = jest.fn(() => Promise.reject(error))
      const errorHandlerFn = jest.fn()

      const c = new Collection<IGenerics>({ fetchFn, searchFn, errorHandlerFn })
      await c.search("someQuery")

      expect(errorHandlerFn).toBeCalledWith(error)
    })
  })

  describe("setQueryParam()", () => {
    it("saves param to state", async () => {
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setQueryParam("foo", "bar")

      expect(c.queryParams).toEqual({ foo: "bar" })
    })
  })

  describe("setQueryParams()", () => {
    it("saves params to state, clears other state", async () => {
      const params = { foo: "foo", bar: 2, baz: { qux: false } }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setQueryParams(params)
      expect(c.queryParams).toEqual(params)

      const paramsNew = { dog: "banana" }
      c.setQueryParams(paramsNew)
      expect(c.queryParams).toEqual(paramsNew)
    })

    it("merges params to state if opts.merge is true", () => {
      const opts = { merge: true }
      const params = { foo: "foo", bar: 2, baz: { qux: false } }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setQueryParams(params, opts)
      expect(c.queryParams).toEqual(params)

      const paramsNew = { dog: "banana" }
      c.setQueryParams(paramsNew, opts)
      expect(c.queryParams).toEqual({ ...params, ...paramsNew })
    })

    it("performs fetch request with new params if opts.fetch is true", () => {
      const opts = { fetch: true }
      const params = { foo: "bar" }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setQueryParams(params, opts)
      expect(fetchFn).toBeCalledWith(params)
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
