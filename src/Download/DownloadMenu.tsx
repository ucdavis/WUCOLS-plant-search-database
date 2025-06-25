import { useState, useRef, useEffect } from "react";
import DownloadActionList from './DownloadActionList';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {  pdf } from "@react-pdf/renderer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faQrcode,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { exportToExcel } from "../utils/excelExport";
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
	const [currentBct, setCurrentBct] = useState<BenchCardTemplate | null>(null);
	const zipCancelled = useRef(false);
	const [showZipModal, setShowZipModal] = useState(false);
	const [zipCurrent, setZipCurrent] = useState(0);
	const [zipTotal, setZipTotal] = useState(0);

	const getDownloadActions = (
		data: Data,
		searchCriteria: SearchCriteria,
		plants: Plant[]
	): DownloadAction[] => {
		// No need for side rendering with the new approach
		return [
			{
				include: !!searchCriteria.city,
				method: async () => {
					try {
						const plantBlobPairs = await Promise.all(
							plants.map(async (p: Plant) => {
								const qrCodeInfo = plantDetailQrCodeFromId(p.id);
								const dataUrl = await qrCodeInfo.generate_image_url();
								
								// Convert data URL to blob
								const response = await fetch(dataUrl);
								const blob = await response.blob();
								
								return [p, blob] as [Plant, Blob];
							})
						);

						const zip = new JSZip();
						for (let [p, blob] of plantBlobPairs) {
							zip.file(
								p.commonName + ".png",
								blob as unknown as null,
								{
									blob: true,
								} as unknown as JSZip.JSZipFileOptions & { dir: true }
							);
						}
						const content = await zip.generateAsync({ type: "blob" });
						saveAs(content, "qr-codes.zip");
					} catch (error) {
						console.error('Error generating QR codes:', error);
						alert('Failed to generate QR codes. Please try again.');
					}
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
					exportToExcel({
						filename: `WUCOLS_${searchCriteria.city.name}`,
						data: data,
						plants: plants,
						regionNumbers: [searchCriteria.city.region]
					});
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
					exportToExcel({
						filename: `WUCOLS_all_regions`,
						data: data,
						plants: data.plants,
						regionNumbers: [1, 2, 3, 4, 5, 6]
					});
					console.log('Excel download initiated');
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

	useEffect(() => {
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
								
								// Generate QR code data URL first
								const qrCodeInfo = plantDetailQrCodeFromId(p.id);
								const qrCodeDataUrl = await qrCodeInfo.generate_image_url();
								
								b = await pdf(
									<BenchCardDocument
										benchCardTemplate={currentBct}
										plant={p}
										region={searchCriteria.city.region}
										waterUseByCode={data.waterUseByCode}
										qrCodeDataUrl={qrCodeDataUrl}
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