import { configure } from "mobx"

import { CursorPagination } from "../CursorPagination"
import { Pagination } from "../Pagination"

import { Collection } from "./Collection"

configure({ safeDescriptors: false })

const TEST_DATA = [{ id: "1" }]
const TOTAL_COUNT = TEST_DATA.length

const fetchFn = jest.fn(() =>
  Promise.resolve({
    data: TEST_DATA,
    totalCount: TOTAL_COUNT,
  })
)

const fetchFnCursor = jest.fn(() =>
  Promise.resolve({
    data: [{ id: "1" }],
    nextPageCursor: "foo",
    prevPageCursor: "bar",
  })
)

const fetchFnCursorAndTotal = jest.fn(() =>
  Promise.resolve({
    data: [{ id: "1" }],
    nextPageCursor: "foo",
    prevPageCursor: "bar",
    totalCount: TOTAL_COUNT,
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

      const c = new Collection({ fetchFn, initialFilters: filters })
      await c.fetch()

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("calls config.fetchFn with both default filters and filters passed as argument", async () => {
      const initialFilters = { foo: "foo", bar: 1 }
      const filters = { bar: 2 }

      const c = new Collection({ fetchFn, initialFilters })
      await c.fetch({ filters })

      expect(fetchFn).toBeCalledWith({ ...initialFilters, ...filters })
    })

    it("calls config.fetchFn with filters passed as argument only when opts.clearFilters is true", async () => {
      const initialFilters = { foo: "foo", bar: 1 }
      const filters = { bar: 2 }

      const c = new Collection({ fetchFn, initialFilters })
      await c.fetch({ filters, clearFilters: true })

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("calls config.fetchFn with page/pageSize params if Pagination module used", async () => {
      const c = new Collection({ fetchFn, pagination: Pagination })
      await c.fetch()

      expect(fetchFn).toBeCalledWith({ page: 1, pageSize: 20 })
    })

    it("saves next/prevPageToken when present in the response", async () => {
      const c = new Collection({ fetchFn: fetchFnCursor, pagination: CursorPagination })
      await c.fetch()
      expect(fetchFnCursor).toBeCalledWith({ pageCursor: null, pageSize: 20 })
      expect(c.cursorPagination?.next).toBe("foo")
      expect(c.cursorPagination?.prev).toBe("bar")
    })

    it("calls config.fetchFn with passed in pageCursor if CursorPagination module used", async () => {
      const c = new Collection({ fetchFn: fetchFnCursor, pagination: CursorPagination })
      await c.fetch({ pageCursor: "foo" })
      expect(fetchFnCursor).toBeCalledWith({ pageCursor: "foo", pageSize: 20 })
    })

    it("calls config.fetchFn with passed in pageSize if CursorPagination module used", async () => {
      const c = new Collection({ fetchFn: fetchFnCursor, pagination: CursorPagination })
      await c.fetch({ pageSize: 10 })
      expect(fetchFnCursor).toBeCalledWith({ pageCursor: null, pageSize: 10 })
    })

    it("calls config.fetchFn with passed in pageSize if Pagination module used", async () => {
      const c = new Collection({ fetchFn, pagination: Pagination })
      await c.fetch({ pageSize: 10 })
      expect(fetchFn).toBeCalledWith({ page: 1, pageSize: 10 })
    })

    it("calls config.fetchFn with passed in page if Pagination module used", async () => {
      const c = new Collection({ fetchFn, pagination: Pagination })
      await c.fetch({ page: 2 })
      expect(fetchFn).toBeCalledWith({ page: 2, pageSize: 20 })
    })

    it("saves totalCount when returned from fetchFn and Pagination is used", async () => {
      const c = new Collection({ fetchFn, pagination: Pagination })
      await c.fetch()
      expect(c.pagination?.totalCount).toBe(TOTAL_COUNT)
    })

    it("saves totalCount when returned from fetchFn and CursorPagination is used", async () => {
      const c = new Collection({ fetchFn: fetchFnCursorAndTotal, pagination: CursorPagination })
      await c.fetch()
      expect(c.cursorPagination?.totalCount).toBe(TOTAL_COUNT)
    })

    it("warns when pageCursor passed to fetchFn but CursorPagination is NOT used", async () => {
      const spy = jest.spyOn(console, "warn")

      const c = new Collection({ fetchFn: fetchFnCursor })
      await c.fetch({ pageCursor: "foo" })

      expect(spy).toBeCalledWith('"pageCursor" param passed but CursorPagination not initialized') // prettier-ignore
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

  describe("init", () => {
    it("calls fetchFn once", async () => {
      // local mock fn copy so we can assert call times correctly
      const fetchFn = jest.fn(() =>
        Promise.resolve({
          data: [{ id: "1" }],
          totalCount: 1,
        })
      )

      const c = new Collection({ fetchFn })
      await c.init()
      expect(fetchFn).toBeCalledWith({})
      c.init()
      expect(fetchFn).toBeCalledTimes(1)
    })

    it("calls fetchFn once with passed options", async () => {
      const c = new Collection({ fetchFn, initialFilters: { foo: "foo" } })
      await c.init({ filters: { foo: "bar" } })
      expect(fetchFn).toBeCalledWith({ foo: "bar" })
    })
  })

  describe("syncParamsToUrl", () => {
    it("synchronizes filters to URL on change when props.syncParamsToUrl", async () => {
      const c = new Collection({ fetchFn, syncParamsToUrl: true })

      await c.fetch({ filters: { foo: "bar" } })
      expect(window.location.search).toBe("?foo=bar")

      c.filters.merge({ bar: 2 })
      expect(window.location.search).toBe("?bar=2&foo=bar")

      c.filters.merge({ foo: "banana", bar: 5 })
      expect(window.location.search).toBe("?bar=5&foo=banana")

      c.filters.delete("foo")
      expect(window.location.search).toBe("?bar=5")

      c.filters.clear()
      expect(window.location.search).toBe("")
    })
  })

  describe("resetState", () => {
    it("clears data and related state", async () => {
      const filters = { foo: "bar" }
      const c = new Collection({ fetchFn, pagination: Pagination })
      const filtersResetSpy = jest.spyOn(c.filters, "reset")
      const paginationResetSpy = jest.spyOn(c.pagination, "reset")

      await c.fetch({ filters })
      c.resetState()

      expect(c.data.length).toBe(0)
      expect(c.initialized).toBe(false)
      expect(c.searchQuery).toBe("")
      expect(filtersResetSpy).toBeCalled()
      expect(paginationResetSpy).toBeCalled()
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
