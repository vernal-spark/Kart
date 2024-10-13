import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { Drawer, Grid, InputAdornment, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../../App";
import Footer from "../Footer";
import Header from "../Header";
import "./Products.css";
import ProductCard from "../ProductCard";
import Cart, { generateCartItemsFrom } from "../Cart";

const Products = () => {
  const [items, setItems] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [filteredProducts, setfilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productLoading, setProductLoading] = useState(null);

  const handleInputChange = (e) => {
    setSearchKey(e.target.value);
  };

  const performAPICall = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      setfilteredProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (text) => {
    let url = `${config.endpoint}/products`;
    if (text) {
      url = `${config.endpoint}/products/search?value=${text}`;
    }
    return axios
      .get(url)
      .then((response) => {
        setIsLoading(false);
        setfilteredProducts(response.data);
      })
      .catch((e) => {
        setIsLoading(false);
        setfilteredProducts([]);
        if (e.response) {
          if (e.response.status === 404) {
            setfilteredProducts([]);
          } else if (e.response.status === 500) {
            enqueueSnackbar(e.response.data.message, { variant: "error" });
            setProducts(products);
          } else {
            enqueueSnackbar(
              "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
              { variant: "error" }
            );
          }
        }
      });
  };

  const debounceSearch = (debounceTimeout) => {
    clearTimeout(debounceTimeout);
    const newtimerId = setTimeout(() => {
      setIsLoading(true);
      performSearch(searchKey);
    }, 500);
    setDebounceTimeout(newtimerId);
  };

  useEffect(() => {
    debounceSearch(debounceTimeout);
  }, [searchKey]);

  const fetchCart = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      const productsData = await performAPICall();
      const cartData = await fetchCart();
      if (cartData) {
        const cartDetails = await generateCartItemsFrom(
          cartData.cartItems,
          productsData
        );
        setItems(cartDetails);
      }
    })();
  }, []);

  const IsItemInCart = (items, productId) => {
    return items.find((ele) => ele._id === productId);
  };

  const updateCartItems = (cartData, productsData) => {
    const cartItems = generateCartItemsFrom(cartData, productsData);
    setItems(cartItems);
  };

  const addToCart = async (
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!token) {
      enqueueSnackbar("Login to add items to cart", { variant: "warning" });
      return;
    }
    if (options.preventDuplicate && IsItemInCart(items, productId)) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }
    setProductLoading(productId);
    try {
      const method = options.preventDuplicate ? "post" : "put";
      const url = `${config.endpoint}/cart`;
      const payload = { productId, quantity: qty };
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios[method](url, payload, { headers });
      if (response.data) {
        updateCartItems(response.data.cartItems, products);
      }
    } catch (e) {
      console.log(e);
      enqueueSnackbar("Error adding to cart", { variant: "error" });
    } finally {
      setProductLoading(null);
    }
  };

  return (
    <div>
      <Header
        setToken={setToken}
        noOfItemsInCart={items.length ?? 0}
        setIsCartOpen={setIsCartOpen}
      >
        <TextField
          className="search-desktop"
          size="small"
          value={searchKey}
          onChange={(e) => handleInputChange(e)}
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
        />
      </Header>
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        value={searchKey}
        onChange={(e) => handleInputChange(e)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>
        <Grid container item md={12}>
          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
          {isLoading ? (
            <div className="loading">Loading Products...</div>
          ) : (
            <>
              {filteredProducts && filteredProducts.length ? (
                <Box
                  sx={{
                    pt: 2,
                    px: 1,
                    "@media screen and (min-width: 1073px)": { px: 10 },
                  }}
                >
                  <Grid
                    container
                    direction="row"
                    // justifyContent="center"
                    alignItems="center"
                    spacing={3}
                  >
                    {filteredProducts.map((ele) => (
                      <Grid
                        item
                        mb={2}
                        lg={3}
                        sm={6}
                        md={4}
                        key={ele._id}
                        sx={{ width: "100%", minWidth: "300px" }}
                      >
                        <ProductCard
                          product={ele}
                          handleAddToCart={() => {
                            addToCart(ele._id, 1, {
                              preventDuplicate: true,
                            });
                          }}
                          disableAddToCart={productLoading === ele._id}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied color="action" />
                  <h4>No Products Found</h4>
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
      {token ? (
        <Drawer
          anchor="right"
          open={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          PaperProps={{ sx: { bgcolor: "#E9F5E1", height: "100%" } }}
        >
          <Cart
            items={items}
            handleQuantity={addToCart}
            disableAddToCart={productLoading}
          />
        </Drawer>
      ) : null}
      <Footer />
    </div>
  );
};

export default Products;
