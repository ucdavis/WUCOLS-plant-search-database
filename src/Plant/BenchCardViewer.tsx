import React from "react";
import { useParams } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import BenchCardDocument from "./BenchCardDocument";
import { Data } from "../types";

interface BenchCardViewerProps {
  data: Data;
}

const BenchCardViewer = ({ data }: BenchCardViewerProps) => {
  const { plantId, templateId } = useParams();
  
  const plant = data.plants.find(
    (p) => p.id === parseInt(plantId || "") || p.url_keyword === plantId
  );
  
  const template = data.benchCardTemplates.find(
    (t) => t.id === templateId
  );

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

  return (
    <div style={{ height: "100vh" }}>
      <PDFViewer style={{ width: "100%", height: "100%" }}>
        <BenchCardDocument
          plant={plant}
          region={2} // Default to Central Valley region
          waterUseByCode={data.waterUseByCode}
          benchCardTemplate={template}
        />
      </PDFViewer>
    </div>
  );
};

export default BenchCardViewer;
