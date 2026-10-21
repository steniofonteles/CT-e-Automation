import type { Request, Response } from "express";

export class CompanyController {
  async getCurrentCompany(req: Request, res: Response) {
    // const { company, token } = req.body;
    // const { data } = await api.get("//api/Sistema/GetUserSession");
    // res.json({ data });
    res.send("AUTHORIZED");
  }

}
