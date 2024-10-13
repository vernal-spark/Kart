import { Button } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Footer from "../Footer";
import Header from "../Header";
import "./Thanks.css";
import axios from "axios";
import { config } from "../../App";
import { useSnackbar } from "notistack";

const Thanks = () => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const routeToProducts = () => {
    history.push("/");
  };
  const emptyCart = (token) => {
    try {
      return axios
        .post(
          `${config.endpoint}/cart/thanks`,
          {},
          { headers: { authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          return true;
        });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not place order. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return false;
    }
  };
  useEffect(() => {
    emptyCart(localStorage.getItem("token"));
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      history.push("/");
    }
  }, [history]);

  return (
    <>
      <Header />
      <Box className="greeting-container">
        <h2>Yay! It's ordered 😃</h2>
        <p>You will receive an invoice for your order shortly.</p>
        <p>Your order will arrive in 7 business days.</p>
        <Button
          variant="contained"
          size="large"
          id="continue-btn"
          onClick={routeToProducts}
        >
          Continue Shopping
        </Button>
      </Box>
      <Footer />
    </>
  );
};

export default Thanks;
