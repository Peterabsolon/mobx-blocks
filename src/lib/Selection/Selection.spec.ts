import { configure } from "mobx"
import { Selection } from "./Selection"

configure({ safeDescriptors: false })

const TEST_ITEM = { id: "1", name: "Foo" }
const TEST_ITEM_2 = { id: "2", name: "BAR" }

interface ITestItem {
  id: string
  name: string
}

describe("Selection", () => {
  describe("select", () => {
    it("adds item to selected on first call", () => {
      const s = new Selection<ITestItem>()
      s.select(TEST_ITEM)
      expect(s.selected[0]).toEqual(TEST_ITEM)
    })

    it("removes item from selected on second call", () => {
      const s = new Selection<ITestItem>()
      s.select(TEST_ITEM)
      s.select(TEST_ITEM)
      expect(s.selected[0]).toEqual(undefined)
      expect(s.ids[0]).toEqual(undefined)
    })
  })

  describe("set", () => {
    it("sets new items", () => {
      const items: ITestItem[] = [TEST_ITEM, TEST_ITEM_2]
      const s = new Selection<ITestItem>()
      s.set(items)
      expect(s.selected).toEqual(items)
    })
  })
})
