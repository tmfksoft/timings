export default interface TimingsIdMapPayload {
	groups: { [key: string]: string },
	handlers: {[key: string]: [number, string] },
	worlds: { [key: string]: string },
	tileentity: { [key: string]: string },
	entity: { [key: string] :string }
}