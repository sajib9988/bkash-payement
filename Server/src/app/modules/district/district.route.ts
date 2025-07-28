import { Router, Request, Response } from "express";

const router = Router();

// GET /api/v1/shipping/districts
router.get("/districts", (req: Request, res: Response) => {
  const districts = [
    "Dhaka",
    "Chattogram",
    "Khulna",
    "Rajshahi",
    "Barisal",
    "Sylhet",
    "Rangpur",
    "Mymensingh"
  ];
  res.json(districts);
});


export const districtRoutes = router;