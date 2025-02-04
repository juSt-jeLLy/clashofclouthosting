import { Router, Request, Response } from "express";
import { run } from "../plugins/generate-meme.js";

const router = Router();

router.get("/:secret", async (_req: Request, res: Response) => {
  const { secret } = _req.params;
  if (secret === process.env.SECRET_RUN) {
    try {
      res.send({ message: await run() });
    } catch (error) {
      res.send({ message: "error" });
    }
  } else {
    res.send({ message: "bad secret" });
  }
});

export default router;
