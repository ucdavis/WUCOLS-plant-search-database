
import React from 'react';
import PlantTypeBadge from './PlantTypeBadge';
import WaterDropRating from './WaterDropRating';
import PlantFavoriteButton from './PlantFavoriteButton';
import {
  Link
} from "react-router-dom";

const PlantTable = ({plants,photosByPlantName,plantTypeNameByCode,waterUseByCode,region,isPlantFavorite,togglePlantFavorite}) =>
{
  return (
		<table className="table table-sm ">
			<thead>
				<tr>
					<th>
						Photo
					</th>
					<th>
						Name
					</th>
					<th>
						Water Use
					</th>
					<th>
						Type(s)
					</th>
					<th>Favorite</th>
				</tr>
			</thead>
			<tbody>
				{plants.map(p => {
					const imageSize = '64px';
					let wu = waterUseByCode[p.waterUseByRegion[region-1]];
					let photoUrl = !photosByPlantName[p.botanicalName] ? "https://via.placeholder.com/200" : photosByPlantName[p.botanicalName].small.url;
					return (
						<tr key={p.id}>
							<td style={{width:imageSize}}>
								<img className="card-img"
									style={{width:imageSize,height:imageSize,background:`url(${photoUrl})`, backgroundSize:'cover'}}
									src={photoUrl}
									alt={p.botanicalName}/>
							</td>
							<td>
								<Link to={`/plant/${p.id}`}>
									<h6 className="mt-0 mb-1"><em>{p.botanicalName}</em></h6>
								</Link>
								<div>
									{p.commonName}
								</div>
							</td>
							<td>
								<WaterDropRating waterUseCode={wu.code}/>
								<small className="ml-2">
									{wu.name}
								</small>
								<br/>
								<small>
								{wu.percentageET0}% ET<sub>0</sub>
								</small>
							</td>
							<td>
								{p.types.map(t =>
									<PlantTypeBadge
										plantTypeNameByCode={plantTypeNameByCode}
										type={t}
										key={t} />
								)}
							</td>
							<td>
								<PlantFavoriteButton {...{plant: p,togglePlantFavorite,isPlantFavorite  }} />
							</td>
						</tr> 
					);
				})}
			</tbody>
		</table>
  );
};

export default PlantTable;