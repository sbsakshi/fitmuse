import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getImageLabels(imageUrl: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-05-06" });
    
    // Fetch image data from Cloudinary
    const response = await fetch(imageUrl);
    const imageData = Buffer.from(await response.arrayBuffer());

    const prompt = `you are an experienced fashion stylist and return JSON with:
    - category (e.g., top, bottom, dress)
    - color
    - style (e.g., casual, formal)
    - patterns (e.g., striped, floral)
    - seasonality (e.g., summer, winter)
    Return ONLY valid JSON, no markdown. Example:
    { "category": "top", "color": "blue", ... }`;

    const result = await model.generateContent([prompt, {
      inlineData: {
        mimeType: response.headers.get("content-type") || "image/png",
        data: imageData.toString("base64"),
      },
    }]);

    return JSON.parse((await result.response).text());
  } catch (err) {
    console.error("Gemini error:", err);
    return null;
  }
}
