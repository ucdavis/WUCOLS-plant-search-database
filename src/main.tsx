import "./polyfills";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  //BrowserRouter as Router,
  HashRouter as Router,
} from "react-router-dom";
import { Data, WaterUseClassification, WucolsBlobLink } from "./types";

import "./sass/wucols.scss";

// Simple Buffer polyfill for qrcode package
if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = {
    from: () => new Uint8Array(),
    toString: () => '',
    isBuffer: () => false
  };
}

console.log("🚀 Main.tsx loaded - Starting WUCOLS app...");

declare global {
  interface Window {
    wucols_data: Data;
  }
}

// Show loading state immediately
const container = document.getElementById("root");
console.log("📦 Root container found:", !!container);

if (container) {
  console.log("🎨 Showing loading state...");
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 20px;">Loading WUCOLS Plant Database...</p>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    </div>
  `;
}

// Function to process and render data
function processAndRenderData(d: Data) {
  console.log("⚙️ Processing data...");
  window.wucols_data = d;
  d.plants.forEach((p) => {
    p.searchName = (p.commonName + " " + p.botanicalName).toLowerCase();
  });

  d.plantTypeNameByCode = d.plantTypes.reduce(
    (dict: { [key: string]: string }, t) => {
      dict[t.code] = t.name;
      return dict;
    },
    {}
  );

  d.waterUseByCode = d.waterUseClassifications.reduce(
    (dict: { [key: string]: WaterUseClassification }, wu) => {
      dict[wu.code] = wu;
      return dict;
    },
    {}
  );

  d.cityOptions = d.cities
    .map((c) => ({
      id: c.id,
      position: c.position,
      key: c.id,
      name: c.name,
      label: "Region " + c.region + ": " + c.name,
      value: c.name,
      region: c.region,
    }))
    .sort((a, b) => (a.label > b.label ? 1 : a.label < b.label ? -1 : 0));

  d.plantTypes = d.plantTypes.sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  );

  d.benchCardTemplates = d.benchCardTemplates.sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  );

  console.log("🎯 Rendering React app...");
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(
      <Router /*basename={process.env.PUBLIC_URL}*/>
        <App data={d} />
      </Router>
    );
    console.log("✅ App rendered successfully!");
  } else {
    console.error('❌ Root container not found');
  }
}

// Function to load fallback local data
function loadFallbackData() {
  console.log('Loading fallback data from local file...');
  return fetch("/WUCOLS.json")
    .then((r) => {
      if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`);
      }
      return r.json();
    })
    .then((rawData: any) => {
      console.log('Successfully loaded fallback data');
      
      // Provide default values for missing fields
      const transformedData: Data = {
        ...rawData,
        // Provide default values for missing fields
        regions: rawData.regions || [
          { id: 1, name: "North Coast" },
          { id: 2, name: "Central Valley" },
          { id: 3, name: "South Coast" },
          { id: 4, name: "High Desert" },
          { id: 5, name: "Low Desert" }
        ],
        benchCardTemplates: rawData.benchCardTemplates || [
          {
            id: "4x6",
            name: "Standard 4x6",
            sizeInInches: { x: 4, y: 6 }
          },
          {
            id: "5x7",
            name: "5x7 Card",
            sizeInInches: { x: 5, y: 7 }
          },
          {
            id: "large-6x8",
            name: "Large 6x8",
            sizeInInches: { x: 6, y: 8 }
          }
        ],
        // These will be populated by processAndRenderData
        plantTypeNameByCode: {},
        waterUseByCode: {},
        cityOptions: []
      };
      
      console.log('Data loaded successfully. Plant types count:', transformedData.plantTypes.length);
      processAndRenderData(transformedData);
    });
}

// Try to load from API first, fallback to local data
console.log("🌐 Starting API fetch...");
fetch(
  "https://wucols.blob.core.windows.net/wucols-export/meta/wucols-data.json"
)
  .then((r) => {
    console.log("📡 API response received:", r.status, r.statusText);
    if (!r.ok) {
      throw new Error(`HTTP error! status: ${r.status}`);
    }
    return r.json();
  })
  .then((l: WucolsBlobLink) => {
    console.log("🔗 Got blob link:", l.cachedBlobUrl);
    return fetch(l.cachedBlobUrl);
  })
  .then((r) => {
    console.log("📊 Data response received:", r.status, r.statusText);
    if (!r.ok) {
      throw new Error(`HTTP error! status: ${r.status}`);
    }
    return r.json();
  })
  .then((d: Data) => {
    console.log('✅ Successfully loaded data from API, plant count:', d.plants?.length);
    processAndRenderData(d);
  })
  .catch((error) => {
    console.error('Failed to load WUCOLS data from API:', error);
    console.log('Attempting to load fallback data...');
    
    // Try fallback data
    loadFallbackData().catch((fallbackError) => {
      console.error('Failed to load fallback data:', fallbackError);
      const container = document.getElementById("root");
      if (container) {
        container.innerHTML = `
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center; max-width: 500px; padding: 20px;">
              <h2 style="color: #e74c3c; margin-bottom: 20px;">Error Loading Plant Database</h2>
              <p style="margin-bottom: 20px;">Failed to load the WUCOLS plant database from both API and local fallback. This could be due to:</p>
              <ul style="text-align: left; margin-bottom: 20px;">
                <li>Network connectivity issues</li>
                <li>API server temporarily unavailable</li>
                <li>CORS policy restrictions</li>
                <li>Missing local data files</li>
              </ul>
              <p style="margin-bottom: 20px;"><strong>API Error:</strong> ${error.message}</p>
              <p style="margin-bottom: 20px;"><strong>Fallback Error:</strong> ${fallbackError.message}</p>
              <button onclick="window.location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Retry
              </button>
            </div>
          </div>
        `;
      }
    });
  });

