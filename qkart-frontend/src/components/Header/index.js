import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Badge, Box, Button, Stack } from "@mui/material";
import React from "react";
import { useHistory, withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Header.css";
import { LogoutOutlined, ShoppingBag } from "@mui/icons-material";

const Header = ({
  children,
  hasHiddenAuthButtons,
  makeLogout,
  noOfItemsInCart,
  setIsCartOpen,
  isCheckout,
}) => {
  let history = useHistory();

  if (hasHiddenAuthButtons) {
    return (
      <Box className="header">
        <Box className="header-title">
          <Link to="/">
            <img src="logo_light.svg" alt="QKart-icon" />
          </Link>
        </Box>
        {children}
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => {
            history.push("/");
          }}
        >
          Back to explore
        </Button>
      </Box>
    );
  }
  return (
    <Box className="header">
      <Box className="header-title">
        <Link to="/">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Link>
      </Box>
      {children}
      <Stack direction="row" spacing={1} align-item="center">
        {localStorage.getItem("username") ? (
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#00a278" }}>
              {localStorage.getItem("username")[0].toUpperCase()}
            </Avatar>
            {!isCheckout && (
              <Badge
                badgeContent={noOfItemsInCart}
                color="primary"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setIsCartOpen(true);
                }}
              >
                <ShoppingBag color="black" />
              </Badge>
            )}
            <LogoutOutlined
              color="error"
              onClick={() => makeLogout()}
              style={{ cursor: "pointer" }}
            />
          </div>
        ) : (
          <>
            <Button
              color="primary"
              onClick={() => {
                history.push("/login");
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/register")}
            >
              Register
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default withRouter(Header);
