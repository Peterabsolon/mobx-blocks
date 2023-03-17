import { last } from "lodash"
import { FakeCursorApi } from "./FakeCursorApi"

it("works", async () => {
  jest.useFakeTimers()

  const api = new FakeCursorApi()
  const promise = api.getProducts({ pageCursor: null, pageSize: 20 })
  jest.runAllTimers()
  const res = await promise

  expect(res.data.length).toBe(20)
  expect(res.nextPageCursor).toBeDefined()
})

it("pagination works", async () => {
  jest.useFakeTimers()

  const api = new FakeCursorApi()

  const promiseFirst = api.getProducts({
    pageCursor: null,
    pageSize: 20,
  })
  jest.runAllTimers()
  const resFirst = await promiseFirst

  expect(last(resFirst.data)?.id).toBe("4020")
  expect(resFirst.nextPageCursor).toBe("4021")
  expect(resFirst.prevPageCursor).toBe(undefined)

  const promiseSecond = api.getProducts({
    pageCursor: resFirst.nextPageCursor || null,
    pageSize: 20,
  })
  jest.runAllTimers()
  const resSecond = await promiseSecond

  expect(last(resSecond.data)?.id).toBe("4040")
  expect(resSecond.nextPageCursor).toBe("4041")
  expect(resSecond.prevPageCursor).toBe("4001")

  const promiseThird = api.getProducts({
    pageCursor: resSecond.nextPageCursor || null,
    pageSize: 20,
  })
  jest.runAllTimers()
  const resThird = await promiseThird

  expect(last(resThird.data)?.id).toBe("4060")
  expect(resThird.nextPageCursor).toBe("4061")
  expect(resThird.prevPageCursor).toBe("4021")
})
