import { ExcelCellData, ExcelSheetData } from "react-export-excel";
import {
  Data,
  Plant
} from "../types";

const plantsAsExcelSheet = (
	data: Data,
	plants: Plant[],
	regionNumbers: number[]
): ExcelSheetData[] => 
[
	{
		columns: [
			"Type(s)",
			"Botanical Name",
			"Common Name",
			...regionNumbers.flatMap(r => 
				[
					`Region ${r} Water Use`,
					`Region ${r} ET0`,
					`Region ${r} Plant Factor`
				])
		],
		data: plants.map(
			(p) =>
				[
					p.types.map((t) => data.plantTypeNameByCode[t]).join(", "),
					p.botanicalName,
					p.commonName,
					...regionNumbers.flatMap(r => 
						[
							data.waterUseByCode[p.waterUseByRegion[r-1]].name,
							data.waterUseByCode[p.waterUseByRegion[r-1]].percentageET0 + "%",
							data.waterUseByCode[p.waterUseByRegion[r-1]].plantFactor,
						])
				] as ExcelCellData[]
		),
	} as ExcelSheetData
];

export default plantsAsExcelSheet;