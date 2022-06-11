export default interface ResponseHandlerMap {
	[key: string]: {
		name: string,
		group: number,
		":cls"?: number,
	}
}