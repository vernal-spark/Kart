import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  LinearProgress,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart, disableAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia component="img" image={product.image} className="card-img" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            fontWeight={600}
            fontSize={"14px"}
          >
            {product.category}
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            fontWeight={600}
            fontSize={"16px"}
          >
            {product.name}
          </Typography>
          <Typography fontWeight={500}>₹{product.cost}</Typography>
        </CardContent>
        <CardActions className="card-actions">
          {disableAddToCart ? (
            <CircularProgress size={24} />
          ) : (
            <Button color="primary">
              <AddShoppingCartOutlined
                onClick={handleAddToCart}
                className="card-button"
              />
            </Button>
          )}
        </CardActions>
      </div>
    </Card>
  );
};

export default ProductCard;
