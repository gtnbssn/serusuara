import { writable } from "svelte/store";
import { currentWritable } from "./helpers/storeUtils";

export const rightWristPosition = currentWritable({ visibility: 0, x: 0, y: 0, z: 0 })

export const totalForceMagnitude = writable(0);
export const velocityMonitor = writable("");
