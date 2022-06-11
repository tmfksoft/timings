import TimingsSystemGc from "../shared/TimingsSystemGc";

export default interface ResponseSystem {
	timingcost: number,
	name: string,
	version: string,
	jvmversion: string,
	arch: string,
	maxmem: number,
	cpu: number,
	runtime: number,
	flags: string,
	gc: TimingsSystemGc,
	":cls"?: number,
}