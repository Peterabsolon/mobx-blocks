import { Collection } from "./Collection"

interface IFetchParams {
  foo?: string
  bar?: number
  baz?: { qux: boolean }
}

interface IGenerics {
  id: string
  data: { id: string }
  fetchParams: IFetchParams
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

    it("synchronizes query params to URL if props.syncParamsToUrl", async () => {
      const replaceStateSpy = jest.spyOn(window.history, "replaceState")

      const params = { foo: "bar", bar: 2 }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn, syncParamsToUrl: true })
      await c.fetch({ params })

      expect(replaceStateSpy).toHaveBeenCalledWith("", "", "/?bar=2&foo=bar")
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
        expect(c.searchErr).toBe(error)
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
        expect(c.searchErr).toBe(error)
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

  describe("setFetchParam()", () => {
    it("saves param to state", async () => {
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setFetchParam("foo", "bar")

      expect(c.fetchParams).toEqual({ foo: "bar" })
    })

    // TODO
    // it("synchronizes param to URL if props.syncParamsToUrl", async () => {
    //   const replaceStateSpy = jest.spyOn(window.history, "replaceState")

    //   const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

    //   const c = new Collection<IGenerics>({ fetchFn })
    //   c.setFetchParam("foo", "bar")

    //   expect(replaceStateSpy).toHaveBeenCalledWith("", "", "/?bar=2&foo=bar")
    // })
  })

  describe("setFetchParams()", () => {
    it("saves params to state, clears other state", async () => {
      const params = { foo: "foo", bar: 2, baz: { qux: false } }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setFetchParams(params)
      expect(c.fetchParams).toEqual(params)

      const paramsNew = { foo: "banana" }
      c.setFetchParams(paramsNew)
      expect(c.fetchParams).toEqual(paramsNew)
    })

    it("merges params to state if opts.merge is true", () => {
      const opts = { merge: true }
      const params = { bar: 2, baz: { qux: false } }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setFetchParams(params, opts)
      expect(c.fetchParams).toEqual(params)

      const paramsNew = { foo: "banana" }
      c.setFetchParams(paramsNew, opts)
      expect(c.fetchParams).toEqual({ ...params, ...paramsNew })
    })

    it("performs fetch request with new params if opts.fetch is true", () => {
      const opts = { fetch: true }
      const params = { foo: "bar" }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setFetchParams(params, opts)

      expect(fetchFn).toBeCalledWith(params)
    })

    it("synchronizes param to URL if opts.syncToUrl", async () => {
      const replaceStateSpy = jest.spyOn(window.history, "replaceState")

      const params = { foo: "bar" }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      c.setFetchParams(params, { syncToUrl: true })

      expect(replaceStateSpy).toHaveBeenCalledWith("", "", "/?foo=bar")
    })
  })

  describe("clearFetchParam()", () => {
    it("clears specific query param", () => {
      const params = { foo: "foo", bar: 3 }
      const fetchFn = jest.fn()

      const c = new Collection<IGenerics>({ fetchFn })
      c.setFetchParams(params)
      c.clearFetchParam("foo")

      expect(c.fetchParams).toEqual({ bar: 3 })
    })
  })

  describe("reset()", () => {
    it("clears data and related state", async () => {
      const params = { foo: "bar" }
      const fetchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection<IGenerics>({ fetchFn })
      await c.init({ params })
      c.clear()

      expect(c.data.length).toBe(0)
      expect(c.initialized).toBe(false)
      expect(c.searchQuery).toBe("")
      expect(c.fetchParams).toEqual({})
    })

    it("clears errors", async () => {
      const error = new Error("Foo")

      const fetchFn = jest.fn(() => Promise.reject(error))
      const searchFn = jest.fn(() => Promise.reject(error))

      const c = new Collection<IGenerics>({ fetchFn, searchFn })
      await c.fetch()
      await c.search("q")
      expect(c.fetchErr).toBe(error)
      expect(c.searchErr).toBe(error)

      c.clear()

      expect(c.fetchErr).toBe(undefined)
      expect(c.searchErr).toBe(undefined)
    })
  })
})
