import { toast } from "sonner";

// --- CHANGED: Added 'export' ---
export const GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL;
export const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
// --- END CHANGE ---

export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error: any) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error(error.message || "Failed to upload file to IPFS");
  }
}

export async function uploadJSONToIPFS(json: object): Promise<string> {
  const data = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name: "kyc-metadata.json",
    },
    pinataContent: json,
  });

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: data,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const responseData = await res.json();
    return `ipfs://${responseData.IpfsHash}`;
  } catch (error: any) {
    console.error("Error uploading JSON to IPFS:", error);
    throw new Error(error.message || "Failed to upload JSON to IPFS");
  }
}
