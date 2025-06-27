import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import BenchCardDocument from "./BenchCardDocument";
import { generateQrCodeDataUrl } from "./PlantDetailQrCode";
import { Data } from "../types";

interface BenchCardViewerProps {
  data: Data;
}

const BenchCardViewer = ({ data }: BenchCardViewerProps) => {
  const { plantId, templateId } = useParams();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const plant = data.plants.find(
    (p) => p.id === parseInt(plantId || "") || p.url_keyword === plantId
  );
  
  const template = data.benchCardTemplates.find(
    (t) => t.id === templateId
  );

  useEffect(() => {
    if (plant) {
      const generateQrCode = async () => {
        try {
          console.log('BenchCardViewer: Generating QR code for plant:', plant.id);
          
          // Generate the plant detail URL
          const pattern = import.meta.env.VITE_PLANT_DETAIL_URL_PATTERN || "";
          const plantUrl = pattern === "" 
            ? `${window.location.origin}/plant/${plant.id}` 
            : pattern.replace(":id", plant.id.toString());
            
          // Generate QR code directly
          const dataUrl = await generateQrCodeDataUrl(plantUrl);
          console.log('BenchCardViewer: QR code generated:', {
            hasDataUrl: !!dataUrl,
            dataUrlLength: dataUrl?.length,
            dataUrlPrefix: dataUrl?.substring(0, 50)
          });
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('Failed to generate QR code for bench card:', error);
          setQrCodeDataUrl(''); // Set empty string on error
        } finally {
          setLoading(false);
        }
      };

      generateQrCode();
    } else {
      setLoading(false);
    }
  }, [plant]);

  if (!plant) {
    return (
      <div className="container-fluid my-5">
        <div className="alert alert-danger">
          No plant found with ID: {plantId}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container-fluid my-5">
        <div className="alert alert-danger">
          No bench card template found with ID: {templateId}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading bench card...</span>
          </div>
          <p className="mt-3">Generating QR code for bench card...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <BenchCardDocument
          plant={plant}
          region={2} // Default to Central Valley region
          waterUseByCode={data.waterUseByCode}
          benchCardTemplate={template}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      </PDFViewer>
    </div>
  );
};

export default BenchCardViewer;
