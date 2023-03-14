import { Pagination } from "./Pagination"

describe("Pagination", () => {
  it("sets initial state from props", () => {
    const p = new Pagination({ page: 8, pageSize: 1337, totalCount: 100 })
    expect(p.page).toBe(8)
    expect(p.pageSize).toBe(1337)
    expect(p.totalCount).toBe(100)
  })

  it("can go to next page if no total set yet", () => {
    const p = new Pagination()
    p.goToNext()
    expect(p.page).toBe(2)
  })

  it("calls onChange callback", () => {
    const onChange = jest.fn()
    const p = new Pagination({ onChange })
    p.goToNext()
    expect(onChange).toBeCalledTimes(1)
  })

  it("can go to next page if current results count is less than total", () => {
    const p = new Pagination()

    p.setTotalCount(40)
    expect(p.canGoToNext).toBe(true)

    p.goToNext()
    expect(p.canGoToNext).toBe(false)

    p.goToNext()
    expect(p.page).toBe(2)
  })

  it("can not go to prev page when on the first page", () => {
    const p = new Pagination()
    p.goToPrev()
    expect(p.page).toBe(1)
  })

  it("can go to prev page when on later page", () => {
    const p = new Pagination()
    p.goToNext()
    p.goToPrev()
    expect(p.page).toBe(1)
  })

  it("can reset state to initial", () => {
    const p = new Pagination({ page: 3, pageSize: 4, totalCount: 5 })

    p.goToNext()
    p.setPageSize(30)
    p.setTotalCount(40)
    p.resetToInitial()

    expect(p.props).toEqual({
      page: 3,
      pageSize: 4,
      totalCount: 5,
    })
  })

  it("resets to defaults when no initial state passed", () => {
    const p = new Pagination({})

    p.goToNext()
    p.setPageSize(30)
    p.setTotalCount(40)
    p.resetToInitial()

    expect(p.params).toEqual({
      page: 1,
      pageSize: 20,
      totalCount: undefined,
    })
  })

  it("can reset state to default", () => {
    const p = new Pagination({ page: 3, pageSize: 4, totalCount: 5 })

    p.goToNext()
    p.setPageSize(30)
    p.setTotalCount(40)
    p.reset()

    expect(p.params).toEqual({
      page: 1,
      pageSize: 20,
      totalCount: undefined,
    })
  })
})
