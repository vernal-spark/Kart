import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useContext, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { AuthContext, config } from "../../App";
import Footer from "../Footer";
import Header from "../Header";
import "./Login.css";

const Login = () => {
  const [formData, setformdata] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setLoading] = useState(false);
  let history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const { setToken } = useContext(AuthContext);

  const onInputChange = (e) => {
    const [key, value] = [e.target.name, e.target.value];
    setformdata((FormData) => ({ ...FormData, [key]: value }));
  };

  const login = async (formData) => {
    if (!validateInput(formData)) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${config.endpoint}/auth/login`,
        formData
      );
      persistLogin(
        response.data.token,
        response.data.username,
        response.data.balance
      );
      setToken(response.data.token);
      setformdata({
        username: "",
        password: "",
      });
      enqueueSnackbar("Logged in Successfully", { variant: "success" });
      history.push("/");
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    } else if (!data.password) {
      enqueueSnackbar("Password is required field", { variant: "warning" });
      return false;
    }
    return true;
  };

  const persistLogin = (token, username, balance) => {
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            value={formData.username}
            onChange={onInputChange}
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formData.password}
            onChange={onInputChange}
          />
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Button
              onClick={() => login(formData)}
              className="button"
              variant="contained"
            >
              Login to Qkart
            </Button>
          )}
          <p className="secondary-action">
            Don't have an account?{" "}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
