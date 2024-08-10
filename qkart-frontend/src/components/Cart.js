import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { withRouter, useHistory } from "react-router-dom";
import "./Cart.css";

const ItemQuantity = ({ isReadOnly, value, handleAdd, handleDelete }) => {
  return (
    <Stack direction="row" alignItems="center">
      {!isReadOnly ? (
        <>
          <IconButton size="small" color="primary" onClick={handleDelete}>
            <RemoveOutlined />
          </IconButton>
          <Box padding="0.5rem" data-testid="item-qty">
            {value}
          </Box>
          <IconButton size="small" color="primary" onClick={handleAdd}>
            <AddOutlined />
          </IconButton>
        </>
      ) : (
        <Box padding="0.5rem" data-testid="item-qty">
          Qty:{value}
        </Box>
      )}
    </Stack>
  );
};

const Cart = ({ isReadOnly, products, items = [], handleQuantity }) => {
  let history = useHistory();
  const token = localStorage.getItem("token");
  if (!items.length) {
    return (
      <Box fullWidth className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        {items.map((ele) => (
          <Box
            key={ele._id}
            display="flex"
            alignItems="flex-start"
            padding="1rem"
          >
            <Box className="image-container">
              <img src={ele.image} alt="logo" width="100%" height="100%" />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              height="6rem"
              paddingX="1rem"
            >
              <div>{ele.name}</div>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <ItemQuantity
                  isReadOnly={isReadOnly}
                  handleAdd={async () => {
                    handleQuantity(
                      token,
                      items,
                      products,
                      ele.productId,
                      ele.qty + 1
                    );
                  }}
                  handleDelete={async () => {
                    handleQuantity(
                      token,
                      items,
                      products,
                      ele.productId,
                      ele.qty - 1
                    );
                  }}
                  value={ele.qty}
                />
                <Box padding="0.5rem" fontWeight="700">
                  ${ele.cost}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>
        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              className="checkout-btn"
              onClick={() => {
                history.push("/checkout");
              }}
            >
              Checkout
            </Button>
          </Box>
        )}
      </Box>
      {isReadOnly && (
        <Box
          className="cart"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Typography variant="h5" alignSelf="center" component="h2">
            Order Details
          </Typography>
          <Box
            p="1rem"
            display="flex"
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Box>Products</Box>
            <Box>{getTotalItems(items)}</Box>
          </Box>
          <Box
            display="flex"
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Box>Subtotal</Box>
            <Box>${getTotalCartValue(items)}</Box>
          </Box>
          <Box
            display="flex"
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Box>Shipping</Box>
            <Box>$0</Box>
          </Box>
          <Box
            display="flex"
            direction="row"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Box>Total</Box>
            <Box>${getTotalCartValue(items)}</Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default withRouter(Cart);
