import React from 'react';
import PlantTypeBadge from './PlantTypeBadge';
import WaterDropRating from './WaterDropRating';
import { SRLWrapper } from "simple-react-lightbox";
import PlantFavoriteButton from './PlantFavoriteButton';

import {
  Link
} from "react-router-dom";

const PlantDetail = ({plant,plantTypeNameByCode,waterUseByCode,region,regions,isPlantFavorite,togglePlantFavorite}) =>
{
  if(!plant){
    return <div>Invalid Plant</div>;
  }
  //let wu = waterUseByCode[plant.waterUseByRegion[region-1]];
  let regionWaterUsePairs = regions.map(r => 
    [ r, waterUseByCode[plant.waterUseByRegion[r.id-1]] ]);
  return (
    <>
    <Link to="/" className="float-right h1">&times;</Link>
    <div className="container p-5">

      <div className="float-right h2">
        <PlantFavoriteButton {...{plant, togglePlantFavorite, isPlantFavorite  }}/>
      </div>

      <h2 className="mb-4"><em>{plant.botanicalName}</em></h2>

      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>
              Botanical Name
            </th>
            <td>
              <em>{plant.botanicalName}</em>
            </td>
          </tr>
          <tr>
            <th>
              Common Name
            </th>
            <td>
              {plant.commonName}
            </td>
          </tr>
          <tr>
            <th>
              Plant Type(s)
            </th>
            <td>
              {plant.types.map(t => 
                <PlantTypeBadge type={t} plantTypeNameByCode={plantTypeNameByCode} key={t} />)}
            </td>
          </tr>
        </tbody>
      </table>

      {!!plant.culturalInformation && 
        <div>
          <h4 className="mb-4">Cultural Information</h4>
          <div dangerouslySetInnerHTML={{__html: plant.culturalInformation}} />
        </div>
      }

      <div className="row mt-4">
        {!!plant.photos.length &&
          <div className="col">
            <h4 className="mb-4">Photos ({plant.photos.length})</h4>
            <SRLWrapper key="plant gallery">
              {plant.photos.map((p,i) => 
                <div className="card mb-3" key={i}>
                  <a href={p.full.url}>
                    <img src={p.large.url} className="card-img-top" alt={p.caption} />
                  </a>
                  <div className="card-body text-center">
                    <p className="card-text">
                      {p.caption}
                    </p>
                  </div>
                </div>
            )}
            </SRLWrapper>
          </div>
        }
        <div className="col">
          <h4 className="mb-4">Water Usage by Region</h4>
          <table className="table table-bordered">
            <tbody>
              {regionWaterUsePairs.map(([r,wu]) =>
                <tr className={r.id === region ? "table-primary" : ""} key={r.id}>
                  <th>
                    Region {r.id}
                    <div style={{fontWeight:'normal'}}>
                      {r.name}
                    </div>
                  </th>
                  <td style={{whiteSpace:'nowrap'}}>
                    <WaterDropRating waterUseCode={wu.code}/>
                  </td>
                  <td style={{whiteSpace:'nowrap'}}>
                    {wu.name}
                  </td>
                  <td style={{whiteSpace:'nowrap'}}>
                    {wu.percentageET0 === 'N/A' ? 'N/A' : <>{wu.percentageET0}% ET<sub>0</sub></>}
                    
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    </>
  );
};

export default PlantDetail;