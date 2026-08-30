import { Router } from "express";
import {
  listProducts,
  getProduct,
  listCategories,
  validateListQuery,
  makeAsync,
} from "../controllers/productController";

const router = Router();

router.get("/", validateListQuery, makeAsync(listProducts));
router.get("/categories", makeAsync(listCategories));
router.get("/:id", makeAsync(getProduct));

export default router;
