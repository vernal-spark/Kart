import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../../App";
import Footer from "../Footer";
import Header from "../Header";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setformdata] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setLoading] = useState(false);
  let history = useHistory();

  const onInputChange = (e) => {
    const [key, value] = [e.target.name, e.target.value];
    setformdata((FormData) => ({ ...FormData, [key]: value }));
  };

  const register = async (formData) => {
    if (!validateInput(formData)) return;
    setLoading(true);
    const response = axios
      .post(`${config.endpoint}/auth/register`, {
        username: formData.username,
        password: formData.password,
      })
      .then((response) => {
        setLoading(false);
        setformdata({
          username: "",
          password: "",
          confirmPassword: "",
        });
        enqueueSnackbar("Registered Successfully", { variant: "success" });
        history.push("/login");
      })
      .catch((e) => {
        setLoading(false);
        if (e.response && e.response.status === 400) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
            { variant: "error" }
          );
        }
      });
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    } else if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    } else if (!data.password) {
      enqueueSnackbar("Password is required field", { variant: "warning" });
      return false;
    } else if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    } else if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Password do not match", { variant: "warning" });
      return false;
    }
    return true;
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
          <h2 className="title">Register</h2>
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
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={onInputChange}
          />
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Button
              onClick={() => register(formData)}
              className="button"
              variant="contained"
            >
              Register Now
            </Button>
          )}
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
