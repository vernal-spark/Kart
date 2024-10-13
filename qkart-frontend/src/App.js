import Register from "./components/Register";
import { Route, Switch, useHistory } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";
import { createContext, useEffect, useState } from "react";

export const config = {
  endpoint: "http://localhost:8080/v1",
};

export const AuthContext = createContext(null);

function App() {
  const history = useHistory();
  const [token, setToken] = useState(null);

  const makeLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("balance");
    setToken(null);
    history.push("/");
  };

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, setToken, makeLogout }}
      className="App"
    >
      <Switch>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/checkout">
          <Checkout />
        </Route>
        <Route path="/thanks">
          <Thanks />
        </Route>
        <Route path="/">
          <Products />
        </Route>
      </Switch>
    </AuthContext.Provider>
  );
}

export default App;
