import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Plant } from "../types";

const plantDetailUrlFromId = (id: number) => {
  const pattern = import.meta.env.VITE_PLANT_DETAIL_URL_PATTERN || "";
  
  if (pattern === "") {
    // Fallback for development - use current origin
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${currentOrigin}/plant/${id}`;
  }
  
  return new URL(pattern.replace(":id", id.toString())).toString();
};

const generateQrCodeDataUrl = async (text: string): Promise<string> => {
  try {
    // Ensure we use browser-compatible methods only
    const options = {
      type: 'image/png' as const,
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };
    
    // Use toDataURL which is browser-compatible and doesn't require Buffer
    return await QRCode.toDataURL(text, options);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

// Export for use in other components like DownloadMenu
export { generateQrCodeDataUrl };

export const plantDetailQrCodeFromId = (id: number) => {
  const url = plantDetailUrlFromId(id);
  return {
    destination_url: url,
    generate_image_url: () => generateQrCodeDataUrl(url),
  };
};

interface Props {
  plant: Plant;
  style?: React.CSSProperties;
}

export const PlantDetailQrCode = ({ plant, style }: Props) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const destination_url = plantDetailUrlFromId(plant.id);

  useEffect(() => {
    const generateQrCode = async () => {
      if (!destination_url) {
        setError('No destination URL configured');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        console.log('Generating QR code for:', destination_url);
        const dataUrl = await generateQrCodeDataUrl(destination_url);
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    generateQrCode();
  }, [destination_url, plant.id]);

  if (loading) {
    return (
      <div 
        style={{ 
          width: "64px", 
          height: "64px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          border: "1px dashed #ccc",
          fontSize: "10px",
          ...style 
        }}
      >
        QR...
      </div>
    );
  }

  if (error || !qrCodeDataUrl) {
    return (
      <div 
        style={{ 
          width: "64px", 
          height: "64px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          border: "1px dashed #ccc",
          fontSize: "10px",
          color: "#999",
          ...style 
        }}
      >
        No QR
      </div>
    );
  }

  return (
    <a href={destination_url} target="_blank" rel="noreferrer">
      <img
        src={qrCodeDataUrl}
        alt={"QR Code for " + plant.botanicalName}
        className="img-responsive"
        style={{ width: "64px", ...(style || {}) }}
      />
    </a>
  );
};
