import type { Request, Response } from "express";
import authServices from "../services/auth_services.js";

//login
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const response = await authServices.login(email, password);

    res.status(200).json(response);
  } catch (e: any) {}
};

//logout

//refresh?
