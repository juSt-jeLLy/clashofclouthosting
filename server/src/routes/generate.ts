import { Router, Request, Response } from "express";
import { generateMeme } from "../plugins/generate-meme.js";

const router = Router();

router.get("/:keyWords", async (_req: Request, res: Response) => {
  console.log("Getting AI Agent Starter Kit ...");
  const { keyWords } = _req.params;
  try {
    res.send({ cid: await generateMeme(keyWords) });
  } catch (eror) {
    res.send({ message: "error" });
  }
  /*res.status(200).json({
    message: "AI Agent Starter Kit",
    timestamp: new Date().toISOString(),
  });*/
});

export default router;
