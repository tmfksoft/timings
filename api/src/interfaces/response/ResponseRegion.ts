export default interface ResponseRegion {
	regionId: string,
	chunkCount: number,
	areaLocX: number,
	areaLocZ: number,
	tileEntities: {
		[key: string]: number,
	},
	entities: {
		[key: string]: number,
	},
	":cls"?: number,
}