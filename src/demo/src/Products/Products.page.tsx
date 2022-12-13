import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import cx from "classnames"
// import { Pagination } from "../components"

import { store } from "./Products.store"

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
                onChange={(evt) => products.fetch({ filters: { id: Number(evt.target.value) } })}
              />

              <button
                className={cx("btn-ghost btn-sm btn ml-2", {
                  "btn-active": products.orderBy === "id",
                })}
                onClick={() => products.setOrderHelper("id")}
              >
                {products.orderAscending ? "↑" : "↓"}
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
                  "btn-active": products.orderBy === "name",
                })}
                onClick={() => products.setOrderHelper("name")}
              >
                {products.orderAscending ? "↑" : "↓"}
              </button>
            </th>
          </tr>
        </thead>

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
