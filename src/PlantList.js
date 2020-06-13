import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faTint } from '@fortawesome/free-solid-svg-icons'


const FavoriteIcon = () => <FontAwesomeIcon icon={faHeart} />;
const DropIcon = ({filled}) => 
  <span style={{opacity:filled ? 1 : 0.3, color: filled ? '#007bff' : 'grey', padding: '0 2px'}}>
    <FontAwesomeIcon icon={faTint} />
  </span>;

const dropRatingByWaterUseCode = (() => {
  let d = <DropIcon />; 
  let D = <DropIcon filled={true} />;
  //let d = <span role="img" aria-label="empty-water-drop" style={{opacity:0.3}}>💧</span>;
  //let D = <span role="img" aria-label="full-water-drop">💧</span>;
  return {
    'VL': <>{D}{d}{d}{d}</>,
    'LO': <>{D}{D}{d}{d}</>,
    'M':  <>{D}{D}{D}{d}</>,
    'H':  <>{D}{D}{D}{D}</>
  };
})();


const PlantList = ({plants,plantTypeNameByCode,waterUseByCode,region,isPlantFavorite,togglePlantFavorite}) =>
  <div className="row no-gutters">
    {plants.map(p => {
      let wuCode = p.waterUseByRegion[region-1];
      let wu = waterUseByCode[wuCode];
      return (
        <div className="col-md-6" key={p.id}>
          <div className="card mr-2 mb-2">
            <div className="row no-gutters">
              <div className="col-md-4">
                  <button 
                    title={isPlantFavorite(p) 
                      ? "This plant is in your favorites.  Click to remove it."
                      : "Click to add this plant to your favorites."}
                    style={{position:'absolute',top:'5px',right:'5px',color:'unset'}}
                    className={"float-left btn " + (isPlantFavorite(p) ? " btn-light" : "btn-link active")} 
                    onClick={() => togglePlantFavorite(p)}>
                    {isPlantFavorite(p)
                    ? <span style={{color:'red'}}><FavoriteIcon/></span>
                    : <span style={{opacity:0.3}}><FavoriteIcon/></span>}

                  </button>
                  <img className="card-img"
                    src={"https://via.placeholder.com/200"}
                    alt={p.botanicalName}/>
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <div className="float-right text-right ml-3">
                    {dropRatingByWaterUseCode[wu.code]}
                    <br/>
                    <small>
                      {wu.name}
                    </small>
                    <br/>
                    <small>
                    {wu.percentageET0}% ET<sub>0</sub>
                    </small>
                    {/*
                    <div>
                      <input type="checkbox" checked={isPlantFavorite(p)} onChange={() => togglePlantFavorite(p)}/>
                    </div>
                    */}
                  </div>
                  <h5 className="mt-0 mb-1"><em>{p.botanicalName}</em></h5>
                  <div>
                    {p.commonName}
                  </div>
                  <div>
                    {p.types.map(t =>
                      <span key={t}>
                        <span className="badge badge-plantType">
                          {/*
                          🌻💮🌺✽✾✿🎕
                          🌼🌸🌹❁❃❋🌴𐇲
                          🌷❀⚘𐇵🍀☘🌱🍁
                          */}
                         {t === 'A' && <span role="img" aria-label="flower">
                          🌸
                          {' '}
                          </span>}
                          {plantTypeNameByCode[t]}
                        </span>
                        {' '}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
      );
    })}
  </div>;

  export default PlantList;