// lib/getImageLabels.ts
import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY!);

export async function getImageLabels(imageUrl: string): Promise<string[]> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Image fetch failed");

    const blob = await response.blob();
    const results = await hf.imageClassification({
      model: "openai/clip-vit-base-patch32",
      inputs: blob,
    });

    console.log("Hugging Face results:", results);
    return results.map((label) => label.label);
  } catch (err) {
    console.error("CLIP labeling error:", err);
    return [];
  }
}
