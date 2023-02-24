import { toJS } from "mobx"
import { CursorPagination } from "../CursorPagination"
import { Pagination } from "../Pagination"
import { Collection } from "./Collection"

const fetchFn = jest.fn(() =>
  Promise.resolve({
    data: [{ id: "1" }],
    totalCount: 1,
  })
)

describe("Collection", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe("fetch", () => {
    it("performs fetch API request, saves data to state", async () => {
      const c = new Collection({ fetchFn })
      c.fetch()

      expect(c.fetching).toBe(true)
      await fetchFn()

      expect(c.data.length).toBe(1)
      expect(c.fetching).toBe(false)
    })

    it("calls config.fetchFn with filters passed as object", async () => {
      const filters = { foo: "bar" }

      const c = new Collection({ fetchFn })
      await c.fetch({ filters })

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("calls config.fetchFn with filters passed as string", async () => {
      const query = "?foo=bar"

      const c = new Collection({ fetchFn })
      await c.fetch({ query })

      expect(fetchFn).toBeCalledWith({ foo: "bar" })
    })

    it("calls config.fetchFn with default filters", async () => {
      const filters = { foo: "bar" }

      const c = new Collection({ fetchFn, defaultFilters: filters })
      await c.fetch()

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("calls config.fetchFn with both default filters and filters passed as argument", async () => {
      const defaultFilters = { foo: "foo", bar: 1 }
      const filters = { bar: 2 }

      const c = new Collection({ fetchFn, defaultFilters })
      await c.fetch({ filters })

      expect(fetchFn).toBeCalledWith({ ...defaultFilters, ...filters })
    })

    it("calls config.fetchFn with filters passed as argument only when opts.clearFilters is true", async () => {
      const defaultFilters = { foo: "foo", bar: 1 }
      const filters = { bar: 2 }

      const c = new Collection({ fetchFn, defaultFilters })
      await c.fetch({ filters, clearFilters: true })

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("calls config.fetchFn with page/pageSize params if Pagination module used", async () => {
      const c = new Collection({ fetchFn, pagination: Pagination })
      await c.fetch()

      expect(fetchFn).toBeCalledWith({ page: 1, pageSize: 20 })
    })

    it("calls config.fetchFn with nextPageToken params if CursorPagination module used", async () => {
      const c = new Collection({ fetchFn, pagination: CursorPagination })
      await c.fetch()

      expect(fetchFn).toBeCalledWith({ nextPageToken: undefined })
    })

    it("synchronizes filters to URL if props.syncParamsToUrl", async () => {
      const replaceStateSpy = jest.spyOn(window.history, "replaceState")
      const filters = { foo: "bar", bar: 2 }

      const c = new Collection({ fetchFn, syncParamsToUrl: true })
      await c.fetch({ filters })

      expect(replaceStateSpy).toHaveBeenCalledWith("", "", "/?bar=2&foo=bar")
    })

    it("catches error, saves it to state", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))

      const c = new Collection({ fetchFn })
      await c.fetch()

      expect(c.fetchErr).toBe(error)
    })

    it("rethrows error if opts.shouldThrowError is true", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const c = new Collection({ fetchFn })

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

      const c = new Collection({ fetchFn, errorHandlerFn })
      await c.fetch()

      expect(errorHandlerFn).toBeCalledWith(error)
    })

    // TODO: Use for fetchMore()
    it.skip("appends new data to exisitng", async () => {
      const c = new Collection({ fetchFn })
      await c.fetch()
      expect(c.data.length).toBe(1)

      await c.fetch()
      expect(c.data.length).toBe(2)
    })
  })

  describe("search", () => {
    it("performs search API request, replaces results", async () => {
      // use fake timers so workaround debounce
      jest.useFakeTimers()

      const searchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection({ fetchFn, searchFn })
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

      const c = new Collection({ fetchFn })

      const promise = c.search("someQuery")
      jest.runAllTimers()
      await promise

      expect(c.searching).toBe(false)
    })

    it("debounces search, uses last search query", async () => {
      jest.useFakeTimers()

      const searchFn = jest.fn(() => Promise.resolve([{ id: "1" }]))

      const c = new Collection({ fetchFn, searchFn })
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

      const c = new Collection({ fetchFn, searchFn })

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

      const c = new Collection({ fetchFn, searchFn })

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

      const c = new Collection({ fetchFn, searchFn, errorHandlerFn })
      await c.search("someQuery")

      expect(errorHandlerFn).toBeCalledWith(error)
    })
  })

  describe("setFetchParams", () => {
    it("saves filters to state, clears other state", async () => {
      const filters = { foo: "foo", bar: 2, baz: { qux: false } }

      const c = new Collection({ fetchFn })
      c.setFetchParams(filters)
      expect(c.filters).toEqual(filters)

      const filtersNew = { foo: "banana" }
      c.setFetchParams(filtersNew)
      expect(c.filters).toEqual(filtersNew)
    })
  })

  describe("clearFetchParam", () => {
    it("clears specific query param", () => {
      const filters = { foo: "foo", bar: 3 }
      const fetchFn = jest.fn()

      const c = new Collection({ fetchFn })
      c.setFetchParams(filters)
      c.clearFetchParam("foo")

      expect(toJS(c.filters)).toEqual({ bar: 3 })
    })
  })

  describe("clearFetchParams", () => {
    it("clears all filters", () => {
      const filters = { foo: "foo", bar: 3 }
      const fetchFn = jest.fn()

      const c = new Collection({ fetchFn })
      c.setFetchParams(filters)
      c.clearFetchParams()

      expect(c.filters).toEqual({})
    })
  })

  describe("resetFetchParams", () => {
    it("resets fetch filters to defaults passed through the constructor", () => {
      const defaultFilters = { foo: "foo", bar: 3, baz: { qux: true } }
      const fetchFn = jest.fn()

      const c = new Collection({ fetchFn, defaultFilters })
      c.mergeFetchParams({ baz: { qux: false } })
      c.resetFetchParams()

      expect(c.filters).toEqual(defaultFilters)
    })

    it("clears fetch filters if not defaults passed", () => {
      const fetchFn = jest.fn()

      const c = new Collection({ fetchFn })
      c.mergeFetchParams({ baz: { qux: false } })
      c.resetFetchParams()

      expect(c.filters).toEqual({})
    })
  })

  describe("syncParamsToUrl", () => {
    it("synchronizes filters to URL on change when props.syncParamsToUrl", async () => {
      const c = new Collection({ fetchFn, syncParamsToUrl: true })

      await c.fetch({ filters: { foo: "bar" } })
      expect(window.location.search).toBe("?foo=bar")

      c.mergeFetchParams({ bar: 2 })
      expect(window.location.search).toBe("?bar=2&foo=bar")

      c.setFetchParams({ foo: "banana", bar: 5 })
      expect(window.location.search).toBe("?bar=5&foo=banana")

      c.clearFetchParam("foo")
      expect(window.location.search).toBe("?bar=5")

      c.clearFetchParams()
      expect(window.location.search).toBe("")
    })
  })

  describe("resetState", () => {
    it("clears data and related state", async () => {
      const filters = { foo: "bar" }

      const c = new Collection({ fetchFn })
      await c.fetch({ filters })
      c.resetState()

      expect(c.data.length).toBe(0)
      expect(c.initialized).toBe(false)
      expect(c.searchQuery).toBe("")
      expect(c.filters).toEqual({})
    })

    it("clears errors", async () => {
      const error = new Error("Foo")

      const fetchFn = jest.fn(() => Promise.reject(error))
      const searchFn = jest.fn(() => Promise.reject(error))

      const c = new Collection({ fetchFn, searchFn })
      await c.fetch()
      await c.search("q")
      expect(c.fetchErr).toBe(error)
      expect(c.searchErr).toBe(error)

      c.resetState()
      expect(c.fetchErr).toBe(undefined)
      expect(c.searchErr).toBe(undefined)
    })
  })
})

// describe("createCollection", () => {
//   it("creates a Collection instance", () => {
//     const result = createCollection({ fetchFn })
//     expect(result).toBeInstanceOf(Collection)
//   })
// })
