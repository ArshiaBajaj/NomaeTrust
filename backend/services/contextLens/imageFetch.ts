const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  Referer: "https://www.google.com/",
};

export function resolveImageUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Image URL is required");

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Invalid URL. Paste a direct image link or Google Images URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https image URLs are supported.");
  }

  const host = url.hostname.toLowerCase();

  if (host.includes("google.")) {
    const imgurl = url.searchParams.get("imgurl");
    if (imgurl) return decodeURIComponent(imgurl);

    const imgrefurl = url.searchParams.get("imgrefurl");
    if (imgrefurl) return decodeURIComponent(imgrefurl);

    if (host.includes("googleusercontent.com")) {
      return trimmed;
    }
  }

  if (host.includes("gstatic.com") && url.pathname.includes("/images")) {
    const imgurl = url.searchParams.get("imgurl");
    if (imgurl) return decodeURIComponent(imgurl);
  }

  return trimmed;
}

export function buildGoogleLensUrl(imageUrl: string): string {
  return `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
}

export async function fetchImageBuffer(
  imageUrl: string,
): Promise<{ buffer: Buffer; mimeType: string; finalUrl: string }> {
  const resolved = resolveImageUrl(imageUrl);

  const response = await fetch(resolved, {
    headers: FETCH_HEADERS,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Could not fetch image (${response.status}). Try copying the direct image address from Google Images.`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error(
      "URL did not return an image. Right-click the photo in Google Images and choose “Copy image address”.",
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length < 100) {
    throw new Error("Downloaded image was too small — the URL may be a thumbnail wrapper.");
  }

  if (buffer.length > 15 * 1024 * 1024) {
    throw new Error("Image is larger than 15MB.");
  }

  return {
    buffer,
    mimeType: contentType.split(";")[0],
    finalUrl: response.url || resolved,
  };
}
