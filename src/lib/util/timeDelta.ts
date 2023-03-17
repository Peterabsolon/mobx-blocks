export const timeDelta = (dateA: Date, dateB: Date): number => {
  const timeDiff = Math.abs(dateB.getTime() - dateA.getTime())
  const timeDiffInSecond = Math.ceil(timeDiff / 1000)
  return timeDiffInSecond
}

export const timeDeltaInMinutes = (dateA: Date, dateB: Date): number => {
  return timeDelta(dateA, dateB) / 60
}
