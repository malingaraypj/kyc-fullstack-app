import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';

/**
 * Upload a file to IPFS using Pinata
 * @param file - File to upload
 * @returns IPFS hash (CID)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: 'kyc-document',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    // Try using JWT first, then fallback to API key
    const headers: any = {
      'Content-Type': 'multipart/form-data',
    };

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    } else {
      throw new Error('Pinata credentials not configured. Please add NEXT_PUBLIC_PINATA_JWT to your .env.local file');
    }

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      { headers }
    );

    const ipfsHash = response.data.IpfsHash;
    return `ipfs://${ipfsHash}`;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    if (error.response) {
      throw new Error(`IPFS upload failed: ${error.response.data?.error || error.message}`);
    }
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
}

/**
 * Get IPFS gateway URL from IPFS URI
 * @param ipfsUri - IPFS URI (ipfs://...)
 * @returns HTTP URL to access the file
 */
export function getIPFSGatewayUrl(ipfsUri: string): string {
  if (ipfsUri.startsWith('ipfs://')) {
    const hash = ipfsUri.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  return ipfsUri;
}
