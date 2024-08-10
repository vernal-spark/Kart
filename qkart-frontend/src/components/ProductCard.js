import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia component="img" image={product.image} />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {product.name}
        </Typography>
        <Typography gutterBottom variant="h5" component="div">
          ${product.cost}
        </Typography>
        <Rating name="read-only" value={product.rating} readOnly />
      </CardContent>
      <CardActions className="card-actions">
        <Button
          variant="contained"
          className="card-button"
          startIcon={<AddShoppingCartOutlined />}
          onClick={handleAddToCart}
          fullWidth
        >
          Add To Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
