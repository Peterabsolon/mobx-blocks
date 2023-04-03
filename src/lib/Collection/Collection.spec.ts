import { configure } from "mobx"
import { Cache } from "../Cache"

import { CursorPagination } from "../CursorPagination"
import { Pagination } from "../Pagination"

import { Collection } from "./Collection"

configure({ safeDescriptors: false })

interface ITestItem {
  id: string | number
  name?: string
}

const TEST_DATA: ITestItem[] = [
  { id: "1", name: "Foo" },
  { id: "2", name: "Bar" },
]
const TOTAL_COUNT = TEST_DATA.length

const fetchFn = jest.fn(() =>
  Promise.resolve({
    data: TEST_DATA,
    totalCount: TOTAL_COUNT,
  })
)

const fetchFnCursor = jest.fn(() =>
  Promise.resolve({
    data: [{ id: "1" }] as ITestItem[],
    pageCursor: "baz",
    nextPageCursor: "foo",
    prevPageCursor: "bar",
  })
)

const fetchFnCursorAndTotal = jest.fn(() =>
  Promise.resolve({
    data: [{ id: "1" }] as ITestItem[],
    nextPageCursor: "foo",
    prevPageCursor: "bar",
    totalCount: TOTAL_COUNT,
  })
)

const editFn = jest.fn((id: ITestItem["id"], data: Omit<Partial<ITestItem>, "id">) =>
  Promise.resolve({ id, ...data })
)

describe("Collection", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  describe("bootstrap", () => {
    it("sets up other other modules, hooks up onChange events", () => {
      const c = new Collection({ fetchFn })

      c.pagination.goToNext()
      expect(fetchFn).toBeCalledTimes(1)

      c.cursorPagination.setNext("cursor")
      c.cursorPagination.goToNext()
      expect(fetchFn).toBeCalledTimes(2)

      c.sorting.sort("name")
      expect(fetchFn).toBeCalledTimes(3)

      c.filters.set("name", "dude")
      expect(fetchFn).toBeCalledTimes(4)
    })
  })

  describe("fetch", () => {
    it("performs fetch API request, saves data to state", async () => {
      const c = new Collection({ fetchFn })
      c.fetch()

      expect(c.fetching).toBe(true)
      await fetchFn()

      expect(c.data.length).toBe(TOTAL_COUNT)
      expect(c.fetching).toBe(false)
    })

    it("can fetch with filters passed as object", async () => {
      const filters = { foo: "bar" }

      const c = new Collection({ fetchFn })
      await c.fetch({ filters })

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("can fetch with filters passed as string", async () => {
      const query = "?foo=bar"

      const c = new Collection({ fetchFn })
      await c.fetch({ query })

      expect(fetchFn).toBeCalledWith({ foo: "bar" })
    })

    it("can fetch with default filters", async () => {
      const filters = { foo: "bar" }

      const c = new Collection({ fetchFn, initialFilters: filters })
      await c.fetch()

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("can fetch with both default filters and filters passed as argument", async () => {
      const initialFilters = { foo: "foo", bar: 1 }
      const filters = { bar: 2 }

      const c = new Collection({ fetchFn, initialFilters })
      await c.fetch({ filters })

      expect(fetchFn).toBeCalledWith({ ...initialFilters, ...filters })
    })

    it("can fetch with filters passed as argument only when opts.clearFilters is true", async () => {
      const initialFilters = { foo: "foo", bar: 1 }
      const filters = { bar: 2 }

      const c = new Collection({ fetchFn, initialFilters })
      await c.fetch({ filters, clearFilters: true })

      expect(fetchFn).toBeCalledWith(filters)
    })

    it("can fetch with page/pageSize params if Pagination module used", async () => {
      const c = new Collection({ fetchFn, pagination: Pagination })
      await c.fetch()
      expect(fetchFn).toBeCalledWith({ page: 1, pageSize: 20 })
    })

    it("can fetch with initial sortBy/sortAscending props", async () => {
      const c = new Collection({ fetchFn })
      await c.fetch({ sortBy: "foo", sortAscending: true })
      expect(fetchFn).toBeCalledWith({ sortBy: "foo", sortAscending: true })
    })

    it("saves cursors when present in the response", async () => {
      const c = new Collection({ fetchFn: fetchFnCursor, pagination: CursorPagination })
      await c.fetch()
      expect(fetchFnCursor).toBeCalledWith({ pageCursor: null, pageSize: 20 })
      expect(c.cursorPagination?.next).toBe("foo")
      expect(c.cursorPagination?.current).toBe("baz")
      expect(c.cursorPagination?.prev).toBe("bar")
    })

    it("can fetch with passed in pageCursor if CursorPagination module used", async () => {
      const c = new Collection({ fetchFn: fetchFnCursor, pagination: CursorPagination })
      await c.fetch({ pageCursor: "foo" })
      expect(fetchFnCursor).toBeCalledWith({ pageCursor: "foo", pageSize: 20 })
    })

    it("can fetch with passed in pageSize if CursorPagination module used", async () => {
      const fetchFnCursor = jest.fn(() =>
        Promise.resolve({
          data: [{ id: "1" }],
          nextPageCursor: "foo",
          prevPageCursor: "bar",
        })
      )
      const c = new Collection({ fetchFn: fetchFnCursor, pagination: CursorPagination })
      await c.fetch({ pageSize: 10 })
      expect(fetchFnCursor).toBeCalledWith({ pageCursor: null, pageSize: 10 })
    })

    it("can fetch with passed in pageSize if Pagination module used", async () => {
      const c = new Collection({ fetchFn, pagination: Pagination })
      await c.fetch({ pageSize: 10 })
      expect(fetchFn).toBeCalledWith({ page: 1, pageSize: 10 })
    })

    it("can fetch with passed in page if Pagination module used", async () => {
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

    it("synchronizes filters to URL if config.syncParamsToUrl", async () => {
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

    it("calls config.errorHandlerFn() if passed on error", async () => {
      const error = new Error("Foo")
      const fetchFn = jest.fn(() => Promise.reject(error))
      const errorHandlerFn = jest.fn()

      const c = new Collection({ fetchFn, errorHandlerFn })
      await c.fetch()

      expect(errorHandlerFn).toBeCalledWith(error)
    })

    describe("caching", () => {
      it("returns cached result when cache used", async () => {
        const fetchFn = jest.fn().mockResolvedValue({
          data: TEST_DATA,
          totalCount: TOTAL_COUNT,
        })

        const cache = new Cache()
        const c = new Collection({ cache, fetchFn })
        await c.fetch()

        const res2 = await c.fetch()
        const res3 = await c.fetch()

        // API called only once
        expect(fetchFn).toBeCalledTimes(1)

        // points to the same item
        expect(res2.data[0]).toBe(res3.data[0])
      })

      it("refetches after TTL exired", async () => {
        jest.useFakeTimers()

        const fetchFn = jest.fn().mockResolvedValue({
          data: TEST_DATA,
          totalCount: TOTAL_COUNT,
        })

        const cache = new Cache({ ttl: 1 }) // 1 minute
        const c = new Collection({ cache, fetchFn })

        await c.fetch()
        expect(fetchFn).toBeCalledTimes(1)

        jest.advanceTimersByTime(1000 * 61) // 1 minute 1 second later

        await c.fetch()
        expect(fetchFn).toBeCalledTimes(2) // fetch should be called twice now

        jest.useRealTimers()
      })
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

    it("calls config.errorHandlerFn() if passed on error", async () => {
      const error = new Error("Foo")
      const searchFn = jest.fn(() => Promise.reject(error))
      const fetchFn = jest.fn(() => Promise.reject(error))
      const errorHandlerFn = jest.fn()

      const c = new Collection({ fetchFn, searchFn, errorHandlerFn })
      await c.search("someQuery")

      expect(errorHandlerFn).toBeCalledWith(error)
    })
  })

  describe("fetchOne", () => {
    it("can fetch, returns result", async () => {
      const fetchOneFn = jest.fn().mockResolvedValue({ id: "Qux" })
      const c = new Collection({ fetchFn, fetchOneFn })
      const res = await c.fetchOne("Qux")
      expect(fetchOneFn).toBeCalledWith("Qux")
      expect(res).toEqual({ id: "Qux" })
    })

    it("returns cached result when cache used", async () => {
      const fetchOneFn = jest.fn().mockResolvedValue({ id: "Qux" })

      const cache = new Cache()
      const c = new Collection({ fetchFn, fetchOneFn, cache })

      const res1 = await c.fetchOne("Qux")
      expect(fetchOneFn).toBeCalledWith("Qux")
      expect(res1).toEqual({ id: "Qux" })

      const res2 = await c.fetchOne("Qux", { useCache: true })
      expect(fetchOneFn).toBeCalledTimes(1)
      expect(res2).toEqual({ id: "Qux" })
    })

    it("refetches after TTL expired", async () => {
      jest.useFakeTimers()

      const fetchOneFn = jest.fn().mockResolvedValue({ id: "Qux" })

      const cache = new Cache({ ttl: 1 })
      const c = new Collection({ fetchFn, fetchOneFn, cache })

      const res1 = await c.fetchOne("Qux")
      expect(fetchOneFn).toBeCalledWith("Qux")
      expect(res1).toEqual({ id: "Qux" })

      jest.advanceTimersByTime(1000 * 61)

      const res2 = await c.fetchOne("Qux", { useCache: true })
      expect(fetchOneFn).toBeCalledTimes(2)
      expect(res2).toEqual({ id: "Qux" })

      jest.useRealTimers()
    })

    it("returns undefined if config.fetchOne not passed", async () => {
      const c = new Collection({ fetchFn })
      const res = await c.fetchOne("1")
      expect(res).toBe(undefined)
    })
  })

  describe("edit", () => {
    it("updates data", async () => {
      const id = "1"
      const updates = { name: "Banana" }

      const c = new Collection({ fetchFn, editFn })
      await c.fetch()
      const res = await c.edit(id, updates)

      expect(editFn).toBeCalledWith(id, updates)
      expect(c.data.find((item) => item.id === id)?.name).toBe("Banana")
      expect(res).toEqual({ id, ...updates })
    })

    it("updates cache if passed", async () => {
      const id = "1"
      const updates = { name: "Banana" }
      const cache = new Cache<ITestItem>({ ttl: 1 })

      const c = new Collection({ fetchFn, editFn, cache })
      await c.fetch()
      const res = await c.edit(id, updates)

      expect(editFn).toBeCalledWith(id, updates)
      expect(c.data.find((item) => item.id === id)?.name).toBe("Banana")
      expect(cache.get(id)?.data?.name).toBe("Banana")
      expect(res).toEqual({ id, ...updates })
    })

    it("returns undefined if item with ID not found on the API side", async () => {
      const id = "1"
      const updates = { name: "Banana" }
      const editFn = jest.fn(() => Promise.resolve(undefined))

      const c = new Collection({ fetchFn, editFn })
      await c.fetch()
      const res = await c.edit(id, updates)
      expect(res).toBe(undefined)
    })

    it("returns undefined if editFn not passed", async () => {
      const c = new Collection({ fetchFn })
      await c.fetch()
      const res = await c.edit("1", {})
      expect(res).toBe(undefined)
    })
  })

  describe("addItem", () => {
    it("pushes item to data array if item does not exist", () => {
      const c = new Collection({ fetchFn })
      const item = { id: "5", name: "Banana" }
      c.addItem(item)
      expect(c.data[0]).toEqual(item)
    })

    it("updates existing item if exists", () => {
      const c = new Collection({ fetchFn })
      const item = { id: "5", name: "Banana" }
      const itemUpdated = { id: "5", name: "Dog" }
      c.addItem(item)
      c.addItem(itemUpdated)
      expect(c.data[0].name).toEqual(itemUpdated.name)
    })

    it("updates cached item if exists", () => {
      const cache = new Cache({ ttl: 3 })
      const c = new Collection({ fetchFn, cache })

      const item = { id: "5", name: "Banana" }
      c.addItem(item)

      expect(cache.get("5")?.data).toEqual(item)
    })
  })

  describe("moveItem", () => {
    it("swaps item from/to indxes", async () => {
      const c = new Collection({ fetchFn })
      await c.fetch()
      c.moveItem(0, 1)
      expect(c.data[0].id).toBe("2")
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
    it("synchronizes filters to URL on change when config.syncParamsToUrl", async () => {
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
      const cursorPaginationResetSpy = jest.spyOn(c.cursorPagination, "reset")
      const sortingResetSpy = jest.spyOn(c.sorting, "reset")
      const selectionResetSpy = jest.spyOn(c.selection, "reset")

      await c.fetch({ filters })
      c.resetState()

      expect(c.data.length).toBe(0)
      expect(c.initialized).toBe(false)
      expect(c.searchQuery).toBe("")
      expect(filtersResetSpy).toBeCalled()
      expect(paginationResetSpy).toBeCalled()
      expect(cursorPaginationResetSpy).toBeCalled()
      expect(sortingResetSpy).toBeCalled()
      expect(selectionResetSpy).toBeCalled()
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
