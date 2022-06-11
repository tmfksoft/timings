import Hapi from '@hapi/hapi';
import Zlib from 'zlib';
import { v4 as uuidV4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import Boom from '@hapi/boom';
import Inert from '@hapi/inert';
import TimingsPayload from './interfaces/TimingsPayload';
import { TimingsResponsePayload } from './interfaces/response/ResponsePayload';
import ResponseSystem from './interfaces/response/ResponseSystem';
import ResponseIdMap from './interfaces/response/ResponseIdMap';
import ResponseData from './interfaces/response/ResponseData';
import ResponseHandlerMap from './interfaces/response/ResponseHandlerMap';
import ResponseWorldData from './interfaces/response/ResponseWorldData';
import ResponseRegion from './interfaces/response/ResponseRegion';
import http from 'https';
import ResponseMinuteReport from './interfaces/response/ResponseMinuteReport';
import ResponsePlugin from './interfaces/response/ResponsePlugin';

class TimingsAPI {

	private HTTP: Hapi.Server;
	private pathCache = path.join(__dirname, "..", "data", "cache");

	constructor() {
		this.HTTP = new Hapi.Server({
			port: 8090
		});
	}

	async start() {
		this.HTTP.events.on('response', (request) => {
			// you can use request.log or server.log it's depends
			this.HTTP.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.pathname + ' --> ' + request.response);
		});
		
		// Register Inert, Static resources
		await this.HTTP.register(Inert);

		this.HTTP.route({
			method: "GET",
			path: "/{path*}",
			handler: {
				directory: {
					path: path.join(__dirname, "..", "static")
				}
			}
		});

		this.HTTP.route({
			method: "POST",
			path: "/post",
			options: {
				payload: {
					output: 'data',
					parse: false
				}
			},
			handler: async (req, h) => {
				console.log(req.payload);
				
				let decompressed: Buffer;
				try {
					decompressed = Zlib.gunzipSync(req.payload as Buffer);
				} catch (e) {
					return Boom.badData("Damaged timings data, failed to decompress payload!");
				}

				// Cache this with an ID.
				const cacheId = uuidV4().split("-").join("");

				const pathCache = path.join(__dirname, "..", "data", "cache");
				const cacheFile = path.join(pathCache, `${cacheId}.json`);

				fs.writeFileSync(cacheFile, decompressed.toString());

				return h.response().redirect("http://localhost:8090/api/v1/data/" + cacheId);
			}
		});

		this.HTTP.route({
			method: "GET",
			path: "/api/v1/data/{uuid}",
			handler: async (req, h) => {
				const params = req.params as { uuid: string };

				// Check if the file exists.
				const cacheFile = path.join(this.pathCache, `${params.uuid}.json`);

				if(!fs.existsSync(cacheFile)) {
					return Boom.notFound("No such timing");
				}

				const cacheData = fs.readFileSync(cacheFile);
				
				let timingsData: TimingsPayload | null;
				try {
					timingsData = JSON.parse(cacheData.toString());
					console.log(timingsData);
				} catch (e) {
					return Boom.internal("Failed to read cached timings data, it may be corrupted.");
				}

				if (!timingsData) {
					return Boom.internal();
				}

				const responseData = this.reformatTimings(params.uuid, timingsData);

				return h.response(responseData).type("text/plain");
			}
		});

		// RAW Timings Payload
		this.HTTP.route({
			method: "GET",
			path: "/api/v1/raw/{uuid}",
			handler: async (req, h) => {
				const params = req.params as { uuid: string };

				// Check if the file exists.
				const cacheFile = path.join(this.pathCache, `${params.uuid}.json`);

				if(!fs.existsSync(cacheFile)) {
					return Boom.notFound("No such timing");
				}

				const cacheData = fs.readFileSync(cacheFile);
				return h.response(cacheData).type("text/plain");
			}
		});

		// Formatted timings payload. WITH QUERY STRING *airhorns*
		// This is a backwards compat endpoint :(
		this.HTTP.route({
			method: "GET",
			path: "/api/v1/data",
			handler: async (req, h) => {
				const query = req.query as { id?: string, history?: string };

				if (!query.id) {
					return Boom.notFound("API Requires ID query param.");
				}

				// Check if the file exists.
				const cacheFile = path.join(this.pathCache, `${query.id}.json`);

				if(!fs.existsSync(cacheFile)) {
					return Boom.notFound("No such timing");
				}

				const cacheData = fs.readFileSync(cacheFile);
				
				let timingsData: TimingsPayload;
				try {
					timingsData = JSON.parse(cacheData.toString());
				} catch (e) {
					return Boom.internal("Failed to read cached data, it may be corrupted.");
				}

				if (query.history) {
					// Looks to be related Minute Reports server ticks?
					// Assuming we get timestamps for a time range?
					// Alternatively 0 for everything?
					console.log("History request for ", query.history);
					return {
						history: {
							"0": {
								"children": [
									// RECURSE. No idea why currently. Scientists are still researching this.
								],
								"id": 0,
								"count": 4510,
								"total": 704062279,
								"lagCount": 12,
								"lagTotal": 537837712,
							}
						}
					};
				}

				const responseData = this.reformatTimings(query.id, timingsData);
				return h.response(responseData).type("text/plain");
				
				/*return new Promise( (resolve, reject) => {
					let url = "https://timings.aikar.co/data.php?id=26466be028204a8a805c46665a6ab653";
					if (query.history) {
						url = `${url}&history=${query.history}`;
					}
					http.get(url, (res) => {
						const { statusCode } = res;
						console.log(res);
						if (statusCode && statusCode !== 200) {
							return resolve( h.response().code(statusCode) );
						}

						const rawData: string[] = [];

						res.on('data', (data) => {
							console.log("DATA", data)
							rawData.push(data);
						});

						res.on('end', () => {
							resolve( rawData.join("") );
						})
					});
				});*/
			}
		});

		await this.HTTP.start();
	}

	mapFind(index: string | number, map: { [key: string]: string }): string | null {
		if (map[index]) {
			return map[index];
		}
		return null;
	}

	// Unsure what's going on here.
	// Mostly lifted this verbtaim from the PHP code.
	calculateRegionId(x: number, z: number): { areaLocX: number, areaLocZ: number } {
		const locX = Math.floor(x >> 5) << 5 << 4;
		const locZ = Math.floor(z >> 5) << 5 << 4;

		return {
			areaLocX: locX,
			areaLocZ: locZ,
		}
	}

	reformatTimings(id: string, timingsData: TimingsPayload): TimingsResponsePayload {
		// Build System Data
		const systemData: ResponseSystem = {
			timingcost: timingsData.system.timingcost,
			name: timingsData.system.name,
			version: timingsData.system.version,
			jvmversion: timingsData.system.jvmversion,
			arch: timingsData.system.arch,
			maxmem: timingsData.system.maxmem,
			cpu: timingsData.system.cpu,
			runtime: timingsData.system.runtime,
			flags: timingsData.system.flags,
			gc: timingsData.system.gc,
		};

		// Build the handler map
		const handlerMap: ResponseHandlerMap = {};
		for (let key in timingsData.idmap.handlers) {
			const rawData = timingsData.idmap.handlers[key];
			handlerMap[key] = {
				name: rawData[1],
				group: rawData[0]
			}
		}

		// Build the ID Map
		// Thankfully theres no difference other than key names.
		const idMap: ResponseIdMap = {
			groupMap: timingsData.idmap.groups,
			handlerMap: handlerMap,
			worldMap: timingsData.idmap.worlds,
			tileEntityTypeMap: timingsData.idmap.tileentity,
			entityTypeMap: timingsData.idmap.entity,
		};

		// Build up the timings data.
		const data: ResponseData[] = [];
		let dataId = 0;

		// Loop over the data objects.
		for (let rawData of timingsData.data) {

			// Build our World Data Object
			const worldData: { [key: string]: ResponseWorldData } = {};
			for (let worldIndex in rawData.w) {
				const worldName = this.mapFind(worldIndex, idMap.worldMap);
				const worldRawData = rawData.w[worldIndex];

				if (!worldName) {
					// Skip worlds we don't know.
					continue;
				}

				// Build this regions data object.
				const regions: { [key:string]: ResponseRegion } = {};
				for (let regionData of worldRawData) {
					const regionId = this.calculateRegionId(regionData[0], regionData[1]);

					const tileEntities: { [key: string]: number } = {};
					const entities: { [key: string]: number } = {};

					// Loop over all the tile entity ID's and map them to their names.
					for (let tEnt in regionData[3]) {
						const entityName = this.mapFind(tEnt, idMap.tileEntityTypeMap);
						const entityValue = regionData[3][tEnt];
						if (entityName) {
							tileEntities[entityName] = entityValue;
						} else {
							// For the sake of bugs, expose a temporary name.
							tileEntities[`tileEntity_${tEnt}`] = entityValue;
						}
					}

					// Loop over all the entity ID's and map them to their names.
					for (let ent in regionData[3]) {
						const entityName = this.mapFind(ent, idMap.entityTypeMap);
						const entityValue = regionData[2][ent];
						if (entityName) {
							entities[entityName] = entityValue;
						} else {
							// For the sake of bugs, expose a temporary name.
							tileEntities[`entitiy_${ent}`] = entityValue;
						}
					}

					// The Region Object.
					const region: ResponseRegion = {
						regionId: `${regionId.areaLocX}:${regionId.areaLocZ}`,
						chunkCount: 1, // TODO: Look into this closer
						areaLocX: regionId.areaLocX,
						areaLocZ: regionId.areaLocZ,
						tileEntities,
						entities,
					};
					regions[`${regionId.areaLocX}:${regionId.areaLocZ}`] = region;
				}

				// Add this world object into the main dataset.
				worldData[worldIndex as string] = {
					worldName,
					regions,
				};
			}

			// Need to implement this... :D kill me
			const minuteReports: ResponseMinuteReport[] = [
				{
					time: 0,
					tps: 0,
					avgPing: 0,
					fullServerTick: {
						id: 1,
						count: 0,
						total: 0,
						lagCount: 0,
						lagTotal: 0,
					},
					ticks: {
						timedTicks: 0,
						playerTicks: 0,
						entityTicks: 0,
						activatedEntityTicks: 0,
						tileEntityTicks: 0,
					}
				}
			];

			// Build the final response.
			const dataObj: ResponseData = {
				id: dataId,
				start: rawData.s,
				end: rawData.e,
				totalTicks: rawData.tk,
				totalTime: rawData.tm,
				worldData,
				minuteReports, // TODO
			};

			data.push(dataObj);

			// Increment
			dataId++;
		}

		const plugins: { [key: string]: ResponsePlugin } = {};
		for (let pluginName in timingsData.plugins) {
			plugins[pluginName] = {
				name: pluginName,
				...timingsData.plugins[pluginName],
			};
		}

		const responseData: TimingsResponsePayload = {
			id: id,
			timingsMaster: {
				version: timingsData.version,
				maxplayers: timingsData.maxplayers,
				start: timingsData.start,
				end: timingsData.end,
				sampletime: timingsData.sampletime,
				server: timingsData.server,
				motd: timingsData.motd,
				onlinemode: timingsData["online-mode"],
				icon: timingsData.icon,
				system: systemData,
				idmap: idMap,
				plugins,
				data: data,
				config: timingsData.config,
			}
		};
		return responseData;
	}
}
const API = new TimingsAPI();
API.start();