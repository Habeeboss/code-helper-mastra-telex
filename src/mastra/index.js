import { Mastra } from "@mastra/core";

globalThis.___MASTRA_TELEMETRY___ = true;

const mastra = new Mastra();

console.log(" Mastra instance created for deployment");

export default mastra;