import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState, useHistory } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

const Products = () => {
  const [items, setItems] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [filteredProducts, setfilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleInputChange = (e) => {
    setSearchKey(e.target.value);
  };
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    return axios
      .get(`${config.endpoint}/products`)
      .then((response) => {
        setIsLoading(false);
        console.log(response.data);
        setProducts(response.data);
        setfilteredProducts(response.data);
        return response.data;
      })
      .catch((e) => {
        setIsLoading(false);
        if (e.response && e.response.status === 500) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
            { variant: "error" }
          );
        }
      });
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    let url = `${config.endpoint}/products/`;
    if (text) {
      url = `${config.endpoint}/products/search?value=${text}`;
    }
    return axios
      .get(url)
      .then((response) => {
        setIsLoading(false);
        console.log(response.data);
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

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
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

  const fetchCart = async (token) => {
    if (!token) return;
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      return axios
        .get(`${config.endpoint}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log(response.data);
          return response.data;
        });
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
      const cartData = await fetchCart(token);
      console.log(cartData);
      if (cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
        console.log(cartDetails);
      }
    })();
  }, []);

  const IsItemInCart = (items, productId) => {
    return items.find((ele) => ele.productId === productId);
  };

  const updateCartItems = (cartData, productsData) => {
    const cartItems = generateCartItemsFrom(cartData, productsData);
    setItems(cartItems);
  };

  const addToCart = async (
    token,
    items,
    products,
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
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      return axios
        .post(
          `${config.endpoint}/cart`,
          { productId, qty },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          updateCartItems(response.data, products);
        });
    } catch (e) {
      enqueueSnackbar("Error adding to cart", { variant: "error" });
    }
    return true;
  };

  return (
    <div>
      <Header setToken={setToken}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
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
        <Grid container item md={token ? 9 : 12}>
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
                          handleAddToCart={async () => {
                            await addToCart(
                              token,
                              items,
                              products,
                              ele._id,
                              1,
                              {
                                preventDuplicate: true,
                              }
                            );
                          }}
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
        {token ? (
          <Grid container item md={3} bgcolor="#E9F5E1">
            <Cart
              products={products}
              items={items}
              handleQuantity={addToCart}
            />
          </Grid>
        ) : null}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
