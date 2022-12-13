import { observer } from "mobx-react-lite"
import { useEffect } from "react"

import { store } from "./Users.store"

export const Users = observer(() => {
  const { users } = store

  useEffect(() => {
    users.init()
  }, [users])

  if (!users.initialized) {
    return <span>Initializing...</span>
  }

  return (
    <div>
      <input
        className="input-bordered input mb-4 w-full"
        value={users.searchQuery}
        onChange={(evt) => users.search(evt.target.value)}
        placeholder="Search"
      />

      <table className="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>

        <tbody>
          {users.data.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
