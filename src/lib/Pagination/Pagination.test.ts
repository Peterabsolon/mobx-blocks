import { Pagination } from "./Pagination"

describe("Pagination", () => {
  it("can go to next page if no total set yet", () => {
    const pagination = new Pagination()
    pagination.goToNext()
    expect(pagination.page).toBe(2)
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

  it("can not go to prev page when on page 1", () => {
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
