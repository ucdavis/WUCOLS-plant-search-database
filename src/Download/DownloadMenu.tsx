import React from "react";
import ReactDOM from "react-dom";
import DownloadActionList from './DownloadActionList';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {  pdf } from "@react-pdf/renderer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import plantsAsExcelSheet from './plantsAsExcelSheet';
import {
  faFileExcel,
  faQrcode,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import ReactExport from "react-export-excel";
import {
  Button,
  Modal,
  Col,
  Container,
  Row,
  ProgressBar,
} from "react-bootstrap";

import {
  BenchCardTemplate,
  Data,
  DownloadAction,
  Plant,
  SearchCriteria,
} from "../types";
import { plantDetailQrCodeFromId } from "../Plant/PlantDetailQrCode";
import BenchCardDocument from "../Plant/BenchCardDocument";

interface DownloadMenuProps {
	data: Data;
	searchCriteria: SearchCriteria;
	plants: Plant[];
}

const DownloadMenu = ({
	searchCriteria,
	data,
	plants
}: DownloadMenuProps) => {
	const [currentBct, setCurrentBct] = React.useState<BenchCardTemplate | null>(null);
	const zipCancelled = React.useRef(false);
	const [showZipModal, setShowZipModal] = React.useState(false);
	const [zipCurrent, setZipCurrent] = React.useState(0);
	const [zipTotal, setZipTotal] = React.useState(0);

	const getDownloadActions = (
		data: Data,
		searchCriteria: SearchCriteria,
		plants: Plant[]
	): DownloadAction[] => {
		const ExcelFile = ReactExport.ExcelFile;
		const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
		const sideRender = (content: any) => {
			let container = document.getElementById("download-outlet");
			ReactDOM.render(<></>, container, () => {
				/* IMPORTANT!  We clear the dom first, in order to force re-render.
				** Without this, the user can only download an excel document ONCE until they reload the page.  */
				ReactDOM.render(content, container);
			});
		};
		return [
			{
				include: !!searchCriteria.city,
				method: () => {
					Promise.all(
						plants.map((p: Plant) =>
							fetch(plantDetailQrCodeFromId(p.id).image_url)
								.then((r) => r.blob())
								.then((b) => [p, b] as [Plant, Blob])
						)
					).then((plantBlobPairs) => {
						var zip = new JSZip();
						for (let [p, blob] of plantBlobPairs) {
							zip.file(
								p.commonName + ".png",
								blob as unknown as null,
								{
									blob: true,
								} as unknown as JSZip.JSZipFileOptions & { dir: true }
							);
						}
						zip.generateAsync({ type: "blob" }).then(function (content) {
							saveAs(content, "qr-codes.zip");
						});
					});
				},
				label: (
					<>
						<FontAwesomeIcon icon={faQrcode} className="mr-2" />
						Download QR codes
					</>
				),
			},
			...data.benchCardTemplates.map((bct) => ({
				include: !!searchCriteria.city,
				method: () => {
					if (!zipCancelled.current) {
						setCurrentBct(bct);
						setShowZipModal(true);
					}
				},
				label: (
					<>
						<FontAwesomeIcon icon={faIdCard} className="mr-2" />
						Download Bench Cards ({bct.name})
					</>
				),
			})),
			{
				include: !!searchCriteria.city,
				method: () => {
					let excelData = plantsAsExcelSheet(
						data,
						plants,
						[searchCriteria.city.region]
					);
					sideRender(
						<ExcelFile
							filename={`WUCOLS_${searchCriteria.city.name}`}
							hideElement={true}
						>
							<ExcelSheet
								dataSet={excelData}
								name={`WUCOLS_${searchCriteria.city.name}`}
							/>
						</ExcelFile>
					);
				},
				label: (
					<>
						<FontAwesomeIcon icon={faFileExcel} className="mr-2" />
						Download in Excel format
					</>
				),
			},
			{
				include: !searchCriteria.city,
				method: () => {
					console.log('preparing Excel...');
					let excelData = plantsAsExcelSheet(
						data,
						data.plants,
						[1,2,3,4,5,6]
					);
					console.log('rendering...');
					sideRender(
						<ExcelFile
							filename={`WUCOLS_all_regions`}
							hideElement={true}
						>
							<ExcelSheet
								dataSet={excelData}
								name={`WUCOLS_all_regions`}
							/>
						</ExcelFile>
					);
					console.log('rendered');
				},
				label: (
					<>
						<FontAwesomeIcon icon={faFileExcel} className="mr-2" />
						Download WUCOLS plants for all regions
					</>
				),
			}
		].filter(da => da.include);
	};

	React.useEffect(() => {
		if (showZipModal && currentBct && !zipCancelled.current) {
			setZipTotal(plants.length);
			setZipCurrent(0);
			const cb = async () => {
				try {
					const plantBlobPairs = await Promise.all(
						plants.map(async (p: Plant) => {
							let b: any;
							try {
								if (zipCancelled.current) {
									throw new Error("Download cancelled");
								}
								b = await pdf(
									<BenchCardDocument
										benchCardTemplate={currentBct}
										plant={p}
										region={searchCriteria.city.region}
										waterUseByCode={data.waterUseByCode}
									/>
								).toBlob();
								let current = 0;
								setZipCurrent((i) => {
									current = i === 0 ? 1 : i + 1;
									return current;
								});
								console.log(
									`generated bench card ${current} of ${plants.length}`
								);
							} catch (e: any) {
								if (e.message === "Download cancelled") {
									console.log(e.message);
								} else {
									console.error(e);
								}
							}
							return [p, b] as [Plant, Blob];
						})
					);
					if (zipCancelled.current) {
						throw new Error("Download cancelled");
					}
					var zip = new JSZip();
					for (let [p, blob] of plantBlobPairs) {
						zip.file(
							p.commonName + ".pdf",
							blob as unknown as null,
							{
								blob: true,
							} as unknown as JSZip.JSZipFileOptions & { dir: true }
						);
					}
					await zip.generateAsync({ type: "blob" }).then(function (content) {
						saveAs(content, `bench-cards-${currentBct.name}.zip`);
					});
				} catch (e: any) {
					if (e.message === "Download cancelled") {
						console.log(e.message);
					} else {
						console.error(e);
					}
				} finally {
					setShowZipModal(false);
					setZipCurrent(0);
					setZipTotal(0);
					setCurrentBct(null);
					zipCancelled.current = false;
				}
			};
			cb();
		}
	}, [showZipModal, setShowZipModal, currentBct]); // eslint-disable-line react-hooks/exhaustive-deps

	const actionList = DownloadActionList({downloadActions: getDownloadActions(data, searchCriteria, plants)});

	const modal = <Modal
		show={showZipModal}
		onHide={() => {
			zipCancelled.current = true;
			setShowZipModal(false);
		}}
	>
		<Modal.Header closeButton>
			<Modal.Title>Generating Zip file</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			<Container fluid>
				<Row>
					<Col>Please wait. It can take a few seconds per bech card.</Col>
				</Row>
				<Row>
					<Col>
						<ProgressBar
							now={Math.round((zipCurrent / zipTotal) * 100)}
							label={`${zipCurrent} of ${zipTotal}`}
						/>
					</Col>
				</Row>
			</Container>
		</Modal.Body>
		<Modal.Footer>
			<Button
				variant="primary"
				onClick={() => {
					zipCancelled.current = true;
					setShowZipModal(false);
				}}
			>
				Cancel
			</Button>
		</Modal.Footer>
	</Modal>;
	return <>{modal}{actionList}</>;
};

export default DownloadMenu;