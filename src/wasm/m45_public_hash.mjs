// CoachLOL M45. Pure public WASM-only primitive. Do not pass secret fog data.
export function m45PublicHashFromWasm(instanceOrExports, seed, campId, spawnCycle, tick) {
  for (const x of [seed, spawnCycle, tick]) {
    if (!Number.isSafeInteger(x)) throw new TypeError('m45 requires integer coordinates');
  }
  if (typeof campId !== 'string') throw new TypeError('campId must be a string');
  const wasm = instanceOrExports?.exports ?? instanceOrExports;
  if (!wasm || wasm.coachlol_m45_version?.() !== 45 ||
      !wasm.memory || typeof wasm.coachlol_m45_alloc_utf16 !== 'function' ||
      typeof wasm.coachlol_m45_free_utf16 !== 'function' ||
      typeof wasm.coachlol_m45_fnv1a_utf16 !== 'function') {
    throw new TypeError('invalid M45 WebAssembly exports');
  }
  const key = `${seed}|${campId}|${spawnCycle}|${tick}`;
  if (key.length === 0 || key.length > 1048576) throw new RangeError('M45 key length');
  const ptr = wasm.coachlol_m45_alloc_utf16(key.length);
  if (!ptr) throw new RangeError('WASM allocation failed');
  try {
    const units = new Uint16Array(wasm.memory.buffer, ptr, key.length);
    for (let i = 0; i < key.length; i++) units[i] = key.charCodeAt(i);
    return wasm.coachlol_m45_fnv1a_utf16(ptr, key.length) >>> 0;
  } finally {
    wasm.coachlol_m45_free_utf16(ptr, key.length);
  }
}

export async function m45InstantiatePublicWasm(bytesOrModule) {
  const result = await WebAssembly.instantiate(bytesOrModule, {});
  const instance = result.instance ?? result;
  if (instance.exports.coachlol_m45_version?.() !== 45) {
    throw new TypeError('unsupported M45 WASM binary');
  }
  return instance;
}
