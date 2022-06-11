export default interface TimingsDataPayload {
	s: number,
	e: number,
	tk: number,
	tm: number,
	w: {
		[key: string]: [
			number,
			number,
			{ [key:string]: number },
			{ [key:string]: number }
		][],
	},
	h: any[], // Don't fully understand this right now.
	mp: [
		number,
		number,
		number,
		number[],
		number[],
		number,
		number,
		number,
	],
}