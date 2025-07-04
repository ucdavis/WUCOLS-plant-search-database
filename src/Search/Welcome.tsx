const Welcome = () => (
  <div className="welcome-wrapper">
    <h1>Welcome to WUCOLS</h1>
    <div className="lead">
      WUCOLS{" "}
      <span className="discreet">
        Water Use Classification of Landscape Species
      </span>
      <br /><br />
      <p>
        Welcome to the "enhanced" WUCOLS Plant Searchable Database. For an
        overview of the "new enhancements", please click on:{" "}
        <a href="https://ccuh.ucdavis.edu/wucols">WUCOLS</a>
      </p>
      <p>
        WUCOLS Water Use Classification of Landscape Species helps you create a
        landscape plan based on plant water use within your city/region.
      </p>
    </div>
    <h2>
      {" "}
      Instructions (for step-by-step instructions, please click on:{" "}
      <a href="https://ccuh.ucdavis.edu/wucols/plant-search-instructions">
        Step by Step
      </a>
      ):{" "}
    </h2>
    <hr />
    <ol className="instructionlist">
      <li>
        <p>
          <b>Select a City/Region</b> <br />
          This will determine the appropriate water use rating for each plant.
        </p>
      </li>
      <li>
        <p>
          <b>Search a Plant</b> <br />
          Enter any combination of "Plant Name, Water Use, Plant Types" to find
          plants of interest
        </p>
      </li>
      <li>
        <p>
          <b>Favorite</b> <br />
          Assemble a list of your plants that meet your needs.
        </p>
      </li>
      <li>
        <p>
          <b>Download</b> <br />
          Download your list in a variety of formats
        </p>
      </li>
    </ol>
  </div>
);

export default Welcome;
