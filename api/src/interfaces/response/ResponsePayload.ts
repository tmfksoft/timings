import ResponseData from "./ResponseData";
import ResponseSystem from "./ResponseSystem";
import ResponseIdMap from "./ResponseIdMap";
import ResponsePlugin from "./ResponsePlugin";
import ResponseConfig from "./ResponseConfig";

// This is the response payload when data is requested.
export interface TimingsResponsePayload {
	id: string,
	timingsMaster: {
		version: string,
		maxplayers: number,
		start: number,
		end: number,
		onlinemode: boolean, // This differs from the payload
		sampletime: number,
		server: string,
		motd: string,
		icon: null | string,
		system: ResponseSystem,
		idmap: ResponseIdMap,
		plugins: {
			[key: string]: ResponsePlugin
		},
		data: ResponseData[],
		config: ResponseConfig,
		":cls"?: number, // Class name..?
	}
}