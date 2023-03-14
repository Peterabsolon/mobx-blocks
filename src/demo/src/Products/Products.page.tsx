import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import cx from "classnames"
// import { Pagination } from "../components"

import { store } from "./Products.store"
import { Pagination } from "../components"

export const Products = observer(() => {
  const { products } = store

  useEffect(() => {
    products.init()
  }, [products])

  if (!products.initialized) {
    return <span>Initializing...</span>
  }

  return (
    <div>
      <input
        className="input-bordered input mb-4 w-full"
        value={products.searchQuery}
        onChange={(evt) => products.search(evt.target.value)}
        placeholder="Search"
      />

      <table className="table w-full">
        <thead>
          <tr>
            <th>
              <input
                className="input-bordered input input-sm"
                placeholder="ID"
                value={products.filters.id || ""}
                onChange={(evt) => products.fetch({ filters: { id: evt.target.value } })}
              />

              <button
                className={cx("btn-ghost btn-sm btn ml-2", {
                  "btn-active": products.sorting.key === "id",
                })}
                onClick={() => products.sorting.sort("id")}
              >
                {products.sorting.ascending ? "↑" : "↓"}
              </button>
            </th>

            <th>
              <input
                className="input-bordered input input-sm"
                placeholder="Name"
                value={products.filters.name}
                onChange={(evt) => products.fetch({ filters: { name: evt.target.value } })}
              />

              <button
                className={cx("btn-ghost btn-sm btn ml-2", {
                  "btn-active": products.sorting.key === "name",
                })}
                onClick={() => products.sorting.sort("name")}
              >
                {products.sorting.ascending ? "↑" : "↓"}
              </button>
            </th>
          </tr>
        </thead>

        {products.cursorPagination && (
          <Pagination
            canGoToPrev={products.cursorPagination.canGoToPrev}
            canGoToNext={products.cursorPagination.canGoToNext}
            onGoToPrev={products.cursorPagination.goToPrev}
            onGoToNext={products.cursorPagination.goToNext}
            pagesCount={10}
          />
        )}

        {products.fetching ? (
          "Loading..."
        ) : (
          <tbody>
            {products.data.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {/* <Pagination
        onGoToPrev={products.goToPrevPage}
        onGoToNext={products.goToNextPage}
        onGoTo={(page) => products.goToPage(page)}
        page={products.page}
        pagesCount={products.pagesCount}
      /> */}
    </div>
  )
})
