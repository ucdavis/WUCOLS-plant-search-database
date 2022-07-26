import React from "react";
import ultimatePagination from "ultimate-pagination";
import { Pagination } from "react-bootstrap";

interface PlantPaginationProps {
	pageCount: number;
	pageSize: number;
	currentPageNumber: number; 
	setCurrentPageNumber: (pageNumber: number) => void;
	getCurrentItems: (items:any[]) => any[];
}
 
const clamp = (value:number, min:number, max:number) => {
	if(!value || value < min){
		return min;
	}
	if(max < value){
		return max;
	}
	return value;
}

const getPlantPaginationProps = (
	pageSize:number, 
	itemCount:number,
	mostRecentPageNumber:number, 
	setCurrentPageNumber: (pageNumber: number) => void
): PlantPaginationProps => {
	const pageCount = Math.max(1, Math.ceil(itemCount / pageSize));
	const currentPageNumber = clamp(mostRecentPageNumber, 1, pageCount);
	console.log(mostRecentPageNumber, 1, pageCount, currentPageNumber);
	const getCurrentItems = (items: any[]): any[] => 
		items.slice(
			(currentPageNumber - 1) * pageSize,
			(currentPageNumber + 1) * pageSize
		);
	return {currentPageNumber, setCurrentPageNumber, pageCount, pageSize, getCurrentItems};
};

const PlantPagination = ({pageCount, currentPageNumber, setCurrentPageNumber}: PlantPaginationProps) => {
	if(pageCount <= 1){
		return;
	}
	var paginationModel = ultimatePagination.getPaginationModel({
		// Required
		currentPage: currentPageNumber,
		totalPages: pageCount,

		// Optional
		boundaryPagesRange: 1,
		siblingPagesRange: 1,
		hideEllipsis: false,
		hidePreviousAndNextPageLinks: false,
		hideFirstAndLastPageLinks: false,
	});

	return <Pagination>
		{paginationModel
			.map((p) => {
				const props = {
					key: p.key,
					active: p.isActive,
					onClick: () => setCurrentPageNumber(p.value),
				};
				switch (p.type) {
					//case 'PREVIOUS_PAGE_LINK': return <Pagination.Prev {...props}/>
					//case 'NEXT_PAGE_LINK'    : return <Pagination.Next {...props}/>
					case "PAGE":
						return <Pagination.Item {...props}>{p.value}</Pagination.Item>;
					case "ELLIPSIS":
						return <Pagination.Ellipsis {...props} />;
					default:
						return undefined;
				}
			})
			.filter((f) => !!f)}
	</Pagination>
};

export {
	PlantPagination,
	getPlantPaginationProps
};