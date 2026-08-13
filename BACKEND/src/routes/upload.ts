import { Router, type Request, type Response } from "express";
import { uploadImage, generateSignedUploadParams } from "../services/cloudinary.js";

const router = Router();

/**
 * POST /api/upload/image
 * Body: { image: string }  — base64 data URI or remote URL
 
 */
router.post("/image", async (req: Request, res: Response) => {
  try {
    const { image, folder } = req.body as {
      image: string;
      folder?: string;
    };

    if (!image) {
      res.status(400).json({ error: "No image provided." });
      return;
    }

    const result = await uploadImage(image, folder);

    res.status(200).json({
      url:      result.url,
      publicId: result.publicId,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Image upload failed." });
  }
});

/**
 * GET /api/upload/sign
 * Returns a signed payload the browser uses to upload directly to Cloudinary.
 * This is the recommended approach — keeps API_SECRET on the server.
 */
router.get("/sign", (_req: Request, res: Response) => {
  try {
    const params = generateSignedUploadParams();
    res.status(200).json(params);
  } catch (err) {
    console.error("Sign error:", err);
    res.status(500).json({ error: "Failed to generate upload signature." });
  }
});

export default router;