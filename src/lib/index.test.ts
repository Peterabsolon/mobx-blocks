import { Collection } from "./"

it("Runs without crashing", () => {
  new Collection({
    fetchFn: () =>
      Promise.resolve({
        data: [],
        totalCount: 0,
      }),
  })
})
