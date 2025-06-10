import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { getImageLabels } from "@/lib/getImageLabels";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Step 1: Send to remove.bg
    const removeRes = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY!,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        image_file_b64: base64,
        size: "auto",
      }),
    });

    if (!removeRes.ok) {
      const error = await removeRes.text();
      return NextResponse.json({ error: "remove.bg failed", details: error }, { status: 500 });
    }

    const removedBuffer = Buffer.from(await removeRes.arrayBuffer());

    // Step 2: Upload to Cloudinary
    const streamUpload = () =>
      new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "clothes" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return reject(error);
            }
            console.log("Cloudinary upload result:", result);
            if (!result || !result.secure_url) {
              return reject(new Error("No secure_url found in Cloudinary response"));
            }
            resolve(result.secure_url);
          }
        );
        Readable.from(removedBuffer).pipe(uploadStream);
      });

    const imageUrl = await streamUpload();
    console.log("Image uploaded to Cloudinary:", imageUrl);

    
    let labels = null;
    try {
    labels = await getImageLabels(imageUrl);
    console.log("hugging face labels:", labels);
    } catch (e) {
    console.error(" labeling failed");
    
}

    return NextResponse.json({ url: imageUrl , labels }, { status: 200 });


  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
