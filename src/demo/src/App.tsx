import { observer } from "mobx-react-lite"

import { app } from "./App.store"
import { Products } from "./Products/Products.page"
import { Users } from "./Users/Users.page"

const App = observer(() => {
  return (
    <div className="p-10">
      <div className="tabs mb-5">
        <a
          onClick={() => app.setPage("products")}
          className={`tab tab-bordered ${app.page === "products" ? "tab-active" : ""}`}
        >
          Products
        </a>

        <a
          onClick={() => app.setPage("users")}
          className={`tab tab-bordered ${app.page === "users" ? "tab-active" : ""}`}
        >
          Users
        </a>
      </div>

      {app.page === "products" && <Products />}

      {app.page === "users" && <Users />}
    </div>
  )
})

export default App
