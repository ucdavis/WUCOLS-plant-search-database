import React from "react";
import { DownloadAction } from "../types";

interface Props {
	downloadActions: DownloadAction[];
}

const DownloadActionList = ({downloadActions}: Props) => 
	downloadActions.length === 0 
	? <></> 
	: <div className="mb-3 d-flex flex-column justify-content-around">
		<div className="mb-3">
			{downloadActions.map((a,i) => (
				<div className="my-2" key={i}>
						<button className="btn btn-primary btn-block" onClick={a.method}>
							{a.label}
						</button>
				</div>
			))}
		</div>
		<p>
			QR Codes and Bench Cards can be downloaded individually
			for each plant from that plant&apos;s detail screen.
		</p>
	</div>;

export default DownloadActionList;