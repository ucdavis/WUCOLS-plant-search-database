import { useState, useRef, useEffect } from "react";
import DownloadActionList from './DownloadActionList';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFileExcel,
	faQrcode,
	faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { exportToExcel } from "../utils/excelExport";

import {
	BenchCardTemplate,
	Data,
	DownloadAction,
	Plant,
	SearchCriteria,
} from "../types";
import { plantDetailQrCodeFromId } from "../Plant/PlantDetailQrCode";
import BenchCardDocument from "../Plant/BenchCardDocument";
import SimpleModal from "../Shared/SimpleModal";

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

								// Validate the data URL before fetching
								if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
									throw new Error(`Invalid QR code data URL for plant ${p.commonName || p.id}`);
								}

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
					const plantBlobPairs: [Plant, any][] = [];

					// Process plants sequentially instead of in parallel
					for (let i = 0; i < plants.length; i++) {
						if (zipCancelled.current) {
							throw new Error("Download cancelled");
						}

						const p = plants[i];
						let b: any;

						try {
							// Generate QR code data URL first
							const qrCodeInfo = plantDetailQrCodeFromId(p.id);
							const qrCodeDataUrl = await qrCodeInfo.generate_image_url();

							// Validate the data URL before using it
							if (!qrCodeDataUrl || typeof qrCodeDataUrl !== 'string' || !qrCodeDataUrl.startsWith('data:')) {
								throw new Error(`Invalid QR code data URL for plant ${p.commonName || p.id}`);
							}

							b = await pdf(
								<BenchCardDocument
									benchCardTemplate={currentBct}
									plant={p}
									region={searchCriteria.city.region}
									waterUseByCode={data.waterUseByCode}
									qrCodeDataUrl={qrCodeDataUrl}
								/>
							).toBlob();

							// Update progress after each plant
							setZipCurrent(i + 1);
							console.log(`generated bench card ${i + 1} of ${plants.length}`);
						} catch (e: any) {
							if (e.message === "Download cancelled") {
								console.log(e.message);
								break;
							} else {
								console.error(e);
							}
						}

						plantBlobPairs.push([p, b]);
					}

					if (zipCancelled.current) {
						throw new Error("Download cancelled");
					}

					var zip = new JSZip();
					for (let [p, blob] of plantBlobPairs) {
						if (blob) { // Only add if blob was successfully created
							zip.file(
								p.commonName + ".pdf",
								blob as unknown as null,
								{
									blob: true,
								} as unknown as JSZip.JSZipFileOptions & { dir: true }
							);
						}
					}

					const content = await zip.generateAsync({ type: "blob" });
					saveAs(content, `bench-cards-${currentBct.name}.zip`);
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

	const actionList = <DownloadActionList downloadActions={getDownloadActions(data, searchCriteria, plants)} />;


	const modal = <SimpleModal
		show={showZipModal}
		onHide={() => {
			zipCancelled.current = true;
			setShowZipModal(false);
		}}
	>
		<div className="container-fluid">
			<div className="row">
				<div className="col">
					Please wait. It can take a few seconds per bench card.
				</div>
			</div>
			<div className="row mt-3">
				<div className="col">
					<div className="progress">
						<div
							className="progress-bar"
							role="progressbar"
							style={{ width: `${Math.round((zipCurrent / zipTotal) * 100)}%` }}
							aria-valuenow={zipCurrent}
							aria-valuemin={0}
							aria-valuemax={zipTotal}
						>
							{zipCurrent} of {zipTotal}
						</div>
					</div>
				</div>
			</div>
		</div>
	</SimpleModal>;

	return <>{modal}{actionList}</>;
};

export default DownloadMenu;