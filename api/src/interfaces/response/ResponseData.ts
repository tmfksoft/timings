import ResponseMinuteReport from "./ResponseMinuteReport";
import ResponseWorldData from "./ResponseWorldData";

export default interface ResponseData {
	id: number,
	start: number,
	end: number,
	totalTicks: number,
	totalTime: number,
	worldData: {
		[key: string]: ResponseWorldData
	},
	minuteReports: ResponseMinuteReport[],
	":cls"? : number,
}