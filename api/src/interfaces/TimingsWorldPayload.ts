export default interface TimingsWorldPayload {
	gamerules: { [key: string]: string }, // Made this generic for now.
	"ticking-distance": number,
	"no-ticking-distance": number,
	"sending-distance": number,
}