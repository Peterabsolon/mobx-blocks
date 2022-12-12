import { useEffect } from "react";
import { observer } from "mobx-react-lite";

import { app } from "./App.store";

const App = observer(() => {
  useEffect(() => {
    app.products.fetch();
  }, []);

  return (
    <div className="p-10">
      <input
        className="input-bordered input mb-4 w-full"
        value={app.products.searchQuery}
        onChange={(evt) => app.products.search(evt.target.value)}
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
          {app.products.data.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default App;
