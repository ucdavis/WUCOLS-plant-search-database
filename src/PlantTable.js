
import React from 'react';
import PlantTypeBadge from './PlantTypeBadge';
import WaterDropRating from './WaterDropRating';
import PlantFavoriteButton from './PlantFavoriteButton';
import {
  Link
} from "react-router-dom";

const benchCardForPlantRegionAndTemplateId = (p,region,templateId) => 
	region in p.benchCards && templateId in p.benchCards[region]
	? p.benchCards[region][templateId]
	: undefined;

const PlantTable = ({
	showAvailableMedia,
	plants,
	photosByPlantName,
	plantTypeNameByCode,
	waterUseByCode,
	region,
	isPlantFavorite,
	togglePlantFavorite,
	benchCardTemplates
}) => {
  return (
		<table className="table table-sm ">
			<thead>
				<tr>
					<th rowSpan="2">
						Photo
					</th>
					<th rowSpan="2">
						Name
					</th>
					{showAvailableMedia && 
						<>
							<th rowSpan="2">
								QR Code
							</th>
							<th colSpan={benchCardTemplates.length}>
								Bench Cards
							</th>
						</>
					}
					<th rowSpan="2">
						Water Use
					</th>
					<th rowSpan="2">
						Type(s)
					</th>
					<th rowSpan="2">Favorite</th>
				</tr>
				{showAvailableMedia &&
					<tr>
						{benchCardTemplates.map(t => 
							<th key={t.id}>{t.name}</th>
						)}
					</tr>
				}
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
							{showAvailableMedia && 
								<td>
									<a href={p.qrCodeUrl} target="_blank" rel="noreferrer">
										<img
											src={p.qrCodeUrl} 
											className="img-responsive"
											style={{width:'100px'}}
										/>
									</a>
								</td>
							}
							{showAvailableMedia && 
								benchCardTemplates.map(t => {
									var bc = benchCardForPlantRegionAndTemplateId(p,region,t.id);
									return <td key={t.id}>
										{!bc 
											? <>N/A</> 
											: <a href={bc.url} target="_blank" rel="noreferrer">Download</a>}
									</td>
								}
								)}
							<td>
								<WaterDropRating waterUseCode={wu.code}/>
								<small className="ml-2">
									{wu.name}
								</small>
								<br/>
								<small>
								{wu.percentageET0}% ET<sub>0</sub>
								<br/>Plant Factor: {wu.plantFactor}
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