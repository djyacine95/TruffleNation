import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import sellersRouter from "./sellers";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(sellersRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(dashboardRouter);

export default router;
