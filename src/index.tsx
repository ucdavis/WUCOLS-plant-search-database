import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./Utilities/serviceWorker";
import { ToastProvider } from "react-toast-notifications";
import {
  //BrowserRouter as Router,
  HashRouter as Router,
} from "react-router-dom";
import { Data, WaterUseClassification, WucolsBlobLink } from "./types";

import "./sass/wucols.scss";

declare global {
  interface Window {
    wucols_data: Data;
  }
}
fetch(
  "https://wucols.blob.core.windows.net/wucols-export/meta/wucols-data.json"
)
  .then((r) => r.json())
  .then((l: WucolsBlobLink) => fetch(l.cachedBlobUrl))
  .then((r) => r.json())
  .then((d: Data) => {
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

    ReactDOM.render(
      <ToastProvider
        autoDismiss
        placement="bottom-center"
        autoDismissTimeout={6000}
      >
        <Router /*basename={process.env.PUBLIC_URL}*/>
          <App data={d} />
        </Router>
      </ToastProvider>,
      document.getElementById("root")
    );
  });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
