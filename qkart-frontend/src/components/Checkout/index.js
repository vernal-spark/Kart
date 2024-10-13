import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useContext, useEffect, useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { AuthContext, config } from "../../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "../Cart";
import Footer from "../Footer";
import Header from "../Header";
import "./Checkout.css";

const AddNewAddressView = ({ newAddress, handleNewAddress, addAddress }) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e) => {
          handleNewAddress({
            ...newAddress,
            value: e.target.value,
          });
        }}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => {
            addAddress(newAddress);
            handleNewAddress((currNewAddress) => ({
              value: "",
              isAddingNewAddress: false,
            }));
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() => {
            handleNewAddress((currNewAddress) => ({
              ...currNewAddress,
              isAddingNewAddress: false,
            }));
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const { token, makeLogout } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (e) {
      if (e.response.status === 401) {
        enqueueSnackbar("Session timed out", { variant: "error" });
        makeLogout();
      }
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/users/address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch (e) {
      if (e.response.status === 401) {
        enqueueSnackbar("Session timed out", { variant: "error" });
        makeLogout();
      }
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (newAddress) => {
    return axios
      .post(
        `${config.endpoint}/users/address`,
        { address: newAddress.value },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setAddresses({ ...addresses, all: response.data.address });
        return response.data;
      })
      .catch((e) => {
        if (e.response.status === 401) {
          enqueueSnackbar("Session timed out", { variant: "error" });
          makeLogout();
        }
        if (e.response) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      });
  };

  const deleteAddress = async (addressId) => {
    try {
      return axios
        .delete(`${config.endpoint}/users/address/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setAddresses({ ...addresses, all: response.data.address });
          enqueueSnackbar("Address deleted Successfully", {
            variant: "success",
          });
          return response.data;
        });
    } catch (e) {
      if (e.response.status === 401) {
        enqueueSnackbar("Session timed out", { variant: "error" });
        makeLogout();
      }
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const validateRequest = (items, addresses) => {
    if (localStorage.getItem("balance") < getTotalCartValue(items)) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }
    if (!addresses.all.length) {
      enqueueSnackbar("Please add a new address before proceeding", {
        variant: "warning",
      });
      return false;
    }
    if (!addresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed", {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  const performCheckout = async (items, addresses) => {
    if (!validateRequest(items, addresses)) return;
    try {
      return axios
        .post(
          `${config.endpoint}/cart/checkout`,
          { addressId: addresses.selected },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          const newBalance =
            localStorage.getItem("balance") - getTotalCartValue(items);
          localStorage.setItem("balance", newBalance);
          window.location = response.data.url;
          return true;
        });
    } catch (e) {
      if (e.response.status === 401) {
        enqueueSnackbar("Session timed out", { variant: "error" });
        makeLogout();
      }
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
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart();

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(
          cartData.cartItems,
          productsData
        );
        setItems(cartDetails);
      }
      await getAddresses();
    };
    onLoadHandler();
  }, []);

  if (token) {
    return (
      <>
        <Header makeLogout={makeLogout} isCheckout={true} />
        {token ? (
          <Grid container>
            <Grid item xs={12} md={8.5}>
              <Box className="shipping-container" minHeight="100vh">
                <Typography color="#3C3C3C" variant="h4" my="1rem">
                  Shipping
                </Typography>
                <Typography color="#3C3C3C" my="1rem">
                  Manage all the shipping addresses you want. This way you won't
                  have to enter the shipping address manually with every order.
                  Select the address you want to get your order delivered.
                </Typography>
                <Divider />
                <Box>
                  {addresses.all.length > 0 ? (
                    addresses.all.map((ele) => (
                      <Box
                        key={ele._id}
                        className={
                          addresses.selected === ele._id
                            ? "address-item selected"
                            : "address-item not-selected"
                        }
                        onClick={() => {
                          setAddresses({ ...addresses, selected: ele._id });
                        }}
                      >
                        <Typography>{ele.address}</Typography>
                        <Button
                          startIcon={<Delete />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddress(ele._id);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    ))
                  ) : (
                    <Typography my="1rem">
                      No addresses found for this account. Please add one to
                      proceed
                    </Typography>
                  )}
                </Box>

                {!newAddress.isAddingNewAddress && (
                  <Button
                    color="primary"
                    variant="contained"
                    id="add-new-btn"
                    size="large"
                    onClick={() => {
                      setNewAddress((currNewAddress) => ({
                        ...currNewAddress,
                        isAddingNewAddress: true,
                      }));
                    }}
                  >
                    Add new address
                  </Button>
                )}
                {newAddress.isAddingNewAddress && (
                  <AddNewAddressView
                    newAddress={newAddress}
                    handleNewAddress={setNewAddress}
                    addAddress={addAddress}
                  />
                )}

                <Typography color="#3C3C3C" variant="h4" my="1rem">
                  Payment
                </Typography>
                <Typography color="#3C3C3C" my="1rem">
                  Payment Method
                </Typography>
                <Divider />

                <Box my="1rem">
                  <Typography>Card</Typography>
                </Box>

                <Button
                  startIcon={<CreditCard />}
                  variant="contained"
                  onClick={() => {
                    performCheckout(items, addresses);
                  }}
                >
                  PLACE ORDER
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={3.5} bgcolor="#E9F5E1">
              <Cart isReadOnly products={products} items={items} />
            </Grid>
          </Grid>
        ) : null}
        <Footer />
      </>
    );
  } else {
    enqueueSnackbar("You must be logged in to access checkout page", {
      variant: "warning",
    });
    return <Redirect to="/" />;
  }
};

export default Checkout;
