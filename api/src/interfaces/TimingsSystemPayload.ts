import TimingsSystemGc from "./shared/TimingsSystemGc";

export default interface TimingsSystemPayload {
	timingcost: number,
	loadavg: number,
	name: string,
	version: string,
	jvmversion: string,
	jvmvendor: string,
	jvmvendorversion: null | string,
	arch: string,
	maxmem: number,
	memory: {
		heap: string,
		nonheap: string,
		finalizing: number,
	},
	cpu: number,
	cpuname: string,
	runtime: number,
	flags: string,
	gc: TimingsSystemGc
}