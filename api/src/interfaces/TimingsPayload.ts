// Based off the typical payload from Paper 1.18.2

import TimingsDataPayload from "./TimingsDataPayload";
import TimingsIdMapPayload from "./TimingsIdMapPayload";
import TimingsPlugin from "./TimingsPlugin";
import TimingsSystemPayload from "./TimingsSystemPayload";
import TimingsWorldPayload from "./TimingsWorldPayload";

export default interface TimingsPayload {
	version: string,
	maxplayers: number,
	start: number,
	end: number,
	"online-mode": boolean,
	sampletime: number,
	datapacks: string[],
	server: string,
	motd: string,
	icon: null | string,
	system: TimingsSystemPayload,
	worlds: {
		[key: string]: TimingsWorldPayload,
	},
	idmap: TimingsIdMapPayload,
	plugins: {
		[key: string]: TimingsPlugin
	},
	config: {
		// Generic typing
		spigot: any,
		bukkit: any,
		paper: any,

		// Catch-all for custom servers.
		[key: string]: any,
	},
	data: TimingsDataPayload[],
}