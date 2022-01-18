import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faSearch,
  faStar,
  faLeaf,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const Welcome = () => (
  <div className="text-center my-5">
    <FontAwesomeIcon icon={faLeaf} className="display-4 text-success my-3" />
    <div className="display-4">Welcome to WUCOLS</div>
    <div className="my-4">
      <p className="lead">
        <strong>WUCOLS = </strong>
        {["Water", "Use", "Classification", "Of", "Landscape", "Species"].map(
          (w, i) => (
            <span key={i}>
              <strong className="text-lg">{w[0]}</strong>
              {w.slice(1)}{" "}
            </span>
          )
        )}
      </p>
      <p className="lead">
        WUCOLS helps you create a landscape plan based on plant water use within
        your city/region.
      </p>
    </div>

    <div className="card-group">
      {[
        {
          icon: faMapMarkerAlt,
          label: "Select a City/Region",
          description:
            "This will determine the appropriate water use rating for each plant.",
        },
        {
          icon: faSearch,
          label: "Search",
          description: (
            <>
              Enter any combination of
              {["Plant Name", "Water Use", "Plant Types"].map((txt, i) => (
                <div key={i}>
                  <strong>{txt}</strong>
                </div>
              ))}
              to find plants of interest.
            </>
          ),
        },
        {
          icon: faStar,
          label: "Favorite",
          description: "Assemble a list of your plants that meet your needs.",
        },
        {
          icon: faDownload,
          label: "Download",
          description: "Download your list in a variety of formats",
        },
      ].map((f, i) => (
        <div className="card" key={i}>
          <div className="card-body">
            <FontAwesomeIcon icon={f.icon} className="mt-2 h1" />
            <div className="h4">
              {i + 1 + ". "}
              {f.label}
            </div>
            <div className="card-text mt-5">{f.description}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Welcome;
