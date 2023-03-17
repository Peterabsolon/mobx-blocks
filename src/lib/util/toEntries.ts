export const toEntries = <TItem extends IObjectWithId>(arr: TItem[]): [string, TItem][] => {
  return arr.reduce((acc, item) => {
    acc[item.id.toString()] = item
    return acc
  }, [])
}
