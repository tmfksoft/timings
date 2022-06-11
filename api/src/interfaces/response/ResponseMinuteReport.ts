export default interface ResponseMinuteReport {
	time: number,
	tps: number,
	avgPing: number,
	fullServerTick: {
		id: number,
		count: number,
		total: number,
		lagCount: number,
		lagTotal: number,
		":cls"?: number,
	},
	ticks: {
		timedTicks: number,
		playerTicks: number,
		entityTicks: number,
		activatedEntityTicks: number,
		tileEntityTicks: number,
		":cls"?: number,
	},
	":cls"?: number,
}