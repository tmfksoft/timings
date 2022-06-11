import ResponseHandlerMap from "./ResponseHandlerMap";

export default interface ResponseIdMap {
	groupMap: { [key: string]: string },
	handlerMap: ResponseHandlerMap,
	worldMap: { [key: string]: string },
	tileEntityTypeMap: { [key: string]: string },
	entityTypeMap: { [key: string] :string },
	":cls"?: number,
}