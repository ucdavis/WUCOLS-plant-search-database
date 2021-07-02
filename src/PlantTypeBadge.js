import React from 'react';
const PlantTypeBadge = ({type,plantTypeNameByCode}) =>
  <span>
    <span className="badge badge-plantType">
      {/*
      🌻💮🌺✽✾✿🎕
      🌼🌸🌹❁❃❋🌴𐇲
      🌷❀⚘𐇵🍀☘🌱🍁
      */}
      {type === 'A' && <span role="img" aria-label="flower">
      🌸
      {' '}
      </span>}
      {plantTypeNameByCode[type]}
    </span>
    {' '}
  </span>;

	export default PlantTypeBadge;