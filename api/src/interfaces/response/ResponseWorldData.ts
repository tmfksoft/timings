import ResponseRegion from "./ResponseRegion"

export default interface ResponseWorldData {
	worldName: string,
	regions: {
		[key: string]: ResponseRegion
	}
}