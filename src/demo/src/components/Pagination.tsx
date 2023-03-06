// import { times } from "lodash"
import { observer } from "mobx-react-lite"

export interface IPaginationProps {
  canGoToNext?: boolean
  canGoToPrev?: boolean
  onGoToPrev: () => void
  onGoToNext: () => void
  onGoTo?: (page: number) => void
  page?: number
  pagesCount: number
}

export const Pagination = observer(
  ({ onGoToNext, onGoToPrev, onGoTo, pagesCount, canGoToNext, canGoToPrev }: IPaginationProps) => {
    return (
      <div>
        <div className="btn-group">
          <button className="btn" onClick={onGoToPrev} disabled={!canGoToPrev}>
            «
          </button>

          {/* {times(pagesCount).map((_, index) => (
            <button className="btn" onClick={onGoToPrev}>
              {index + 1}
            </button>
          ))} */}

          <button className="btn" onClick={onGoToNext} disabled={!canGoToNext}>
            »
          </button>
        </div>
      </div>
    )
  }
)
