import { CursorPagination } from "./CursorPagination"

describe("CursorPagination", () => {
  it("sets initial state from config", () => {
    const p = new CursorPagination({ pageSize: 1337 })
    expect(p.pageSize).toBe(1337)
  })

  it("sets current cursor", () => {
    const p = new CursorPagination()
    p.setCurrent("someCursor")
    expect(p.current).toBe("someCursor")
    expect(p.next).toBe(null)
  })

  it("can set page size", () => {
    const p = new CursorPagination()
    p.setPageSize(1337)
    expect(p.pageSize).toBe(1337)
  })

  describe("goToNext", () => {
    it("does not do anything when next cursor not set", () => {
      const p = new CursorPagination()
      p.goToNext()
      expect(p.page).toBe(1) // same as initial
    })

    it("can go to next page when next cursor set", () => {
      const cursor = "cursor"
      const p = new CursorPagination()
      p.setNext(cursor)
      p.goToNext()
      expect(p.page).toBe(2)
      expect(p.current).toBe(cursor)
    })

    it("calls onChange when passed", () => {
      const fn = jest.fn()
      const p = new CursorPagination({ onChange: fn })
      p.setNext("cursor")
      p.goToNext()
      expect(fn).toBeCalledWith({ pageCursor: "cursor", pageSize: 20 })
    })
  })

  describe("goToPrev", () => {
    it("does not do anything when next cursor not set", () => {
      const p = new CursorPagination()
      p.goToPrev()
      expect(p.page).toBe(1) // same as initial
    })

    it("can go to prev page when prev cursor set", () => {
      const cursor = "cursor"
      const p = new CursorPagination()
      p.setPrev(cursor)
      p.goToPrev()
      expect(p.page).toBe(0)
      expect(p.current).toBe(cursor)
    })

    it("calls onChange when passed", () => {
      const fn = jest.fn()
      const p = new CursorPagination({ onChange: fn })
      p.setPrev("cursor")
      p.goToPrev()
      expect(fn).toBeCalledWith({ pageCursor: "cursor", pageSize: 20 })
    })
  })
})
