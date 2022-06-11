export default interface ResponseConfig {
	// Generic typing
	spigot: any,
	bukkit: any,
	paper: any,

	// Catch-all for custom servers.
	[key: string]: any,
}