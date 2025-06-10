import { NextResponse } from "next/server";

export async function GET(){
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apikey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;    
    const folder="clothes";

    const auth = Buffer.from(`${apikey}:${apiSecret}`).toString("base64");

      const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?max_results=100`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error }, { status: res.status });
  }

  const data = await res.json();
  const images = data.resources.map((img: any) => img.secure_url);

  return NextResponse.json({ images });

}