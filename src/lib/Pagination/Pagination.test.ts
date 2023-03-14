import { Pagination } from "./Pagination"

describe("Pagination", () => {
  it("sets initial state from props", () => {
    const p = new Pagination({ page: 8, pageSize: 1337, totalCount: 100 })
    expect(p.page).toBe(8)
    expect(p.pageSize).toBe(1337)
    expect(p.totalCount).toBe(100)
  })

  it("can go to next page if no total set yet", () => {
    const pagination = new Pagination()
    pagination.goToNext()
    expect(pagination.page).toBe(2)
  })

  it("calls onChange callback", () => {
    const onChange = jest.fn()
    const pagination = new Pagination({ onChange })
    pagination.goToNext()
    expect(onChange).toBeCalledTimes(1)
  })

  it("can go to next page if current results count is less than total", () => {
    const pagination = new Pagination()

    pagination.setTotalCount(40)
    expect(pagination.canGoToNext).toBe(true)

    pagination.goToNext()
    expect(pagination.canGoToNext).toBe(false)

    pagination.goToNext()
    expect(pagination.page).toBe(2)
  })

  it("can not go to prev page when on the first page", () => {
    const pagination = new Pagination()
    pagination.goToPrev()
    expect(pagination.page).toBe(1)
  })

  it("can go to prev page when on later page", () => {
    const pagination = new Pagination()
    pagination.goToNext()
    pagination.goToPrev()
    expect(pagination.page).toBe(1)
  })
})
