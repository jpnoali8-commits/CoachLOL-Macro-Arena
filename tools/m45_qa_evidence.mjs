#!/usr/bin/env node
/**
 * M45 B02A: actual execution receipt for native Rust + compiled WASM.
 * Never promotes a mock ABI test to a native/WASM result.
 * Node-only, no external packages, does not contact GitHub or run Actions.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const TASKS = Object.freeze({
  adapter: 'node_adapter_mock_only', jsGolden: 'js_legacy_golden',
  native: 'cargo_native_tests', fmt: 'cargo_fmt', clippy: 'cargo_clippy',
  target: 'wasm_target', wasmBuild: 'wasm_binary_build', wasmSmoke: 'wasm_binary_smoke',
});
export function gateG1(steps) {
  const names = ['native', 'fmt', 'clippy', 'target', 'wasmBuild', 'wasmSmoke'];
  if (names.some(name => steps[name]?.status === 'FAIL')) return 'FAIL';
  if (names.every(name => steps[name]?.status === 'PASS')) return 'PASS_BASELINE_ONLY';
  return 'NOT_RUN';
}
export function statusFromSpawn(output) {
  if (output.error?.code === 'ENOENT') return 'BLOCKED';
  if (output.error || output.status !== 0) return 'FAIL';
  return 'PASS';
}
const unrun = (why) => ({ status: 'NOT_RUN', reason: why });
function run(command, args) {
  const p = spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 180_000, maxBuffer: 8 * 1024 * 1024 });
  const status = statusFromSpawn(p);
  return { status, command: [command, ...args], exit_code: p.status ?? null,
    reason: p.error?.message ?? null,
    stdout_tail: (p.stdout ?? '').slice(-1500), stderr_tail: (p.stderr ?? '').slice(-1500) };
}
const statusCheck = (command, args) => run(command, args).status === 'PASS';
function execute() {
  const cli = process.argv.slice(2);
  const outputFlag = cli.indexOf('--receipt');
  if (outputFlag >= 0 && !cli[outputFlag + 1]) throw new Error('--receipt needs a file path');
  const receiptPath = outputFlag >= 0 ? resolve(cli[outputFlag + 1]) : null;
  const steps = {
    adapter: unrun('not attempted'), jsGolden: unrun('not attempted'),
    native: unrun('native toolchain pending'), fmt: unrun('native toolchain pending'),
    clippy: unrun('native toolchain pending'), target: unrun('rustup pending'),
    wasmBuild: unrun('wasm target pending'), wasmSmoke: unrun('compiled WASM pending'),
  };
  const adapterTest = 'tests/audit/m45_b02_public_adapter_contract.test.mjs';
  steps.adapter = existsSync(resolve(root, adapterTest)) ?
    run(process.execPath, ['--test', adapterTest]) : unrun('adapter source file missing');
  const legacy = 'tests/audit/v453_m45_rust_golden_js_pvp.test.mjs';
  steps.jsGolden = existsSync(resolve(root, 'engine.mjs')) && existsSync(resolve(root, legacy)) ?
    run(process.execPath, [legacy]) : unrun('full integration checkout and golden script unavailable');
  const toolchain = {
    rustc: statusCheck('rustc', ['--version']),
    cargo: statusCheck('cargo', ['--version']),
    rustup: statusCheck('rustup', ['--version']),
  };
  const rustReady = toolchain.rustc && toolchain.cargo;
  if (!rustReady) {
    steps.native = { status: 'BLOCKED', reason: 'rustc/cargo missing' };
    steps.fmt = unrun('rustc/cargo missing');
    steps.clippy = unrun('rustc/cargo missing');
  } else {
    steps.native = run('cargo', ['test', '--workspace', '--all-targets', '--offline']);
    if (steps.native.status === 'PASS') {
      steps.fmt = run('cargo', ['fmt', '--all', '--check']);
      steps.clippy = run('cargo', ['clippy', '--workspace', '--all-targets', '--offline', '--', '-D', 'warnings']);
    } else {
      steps.fmt = unrun('cargo test did not pass');
      steps.clippy = unrun('cargo test did not pass');
    }
  }
  if (rustReady && toolchain.rustup && steps.native.status === 'PASS') {
    const target = run('rustup', ['target', 'list', '--installed']);
    steps.target = target.status === 'PASS' && target.stdout_tail.split(/\r?\n/).includes('wasm32-unknown-unknown') ?
      { ...target, status: 'PASS' } : { ...target, status: 'BLOCKED', reason: 'wasm32-unknown-unknown not installed' };
  } else {
    steps.target = unrun('no native pass and rustup available');
  }
  let wasmSha256 = null;
  if (steps.target.status === 'PASS' && steps.fmt.status === 'PASS' && steps.clippy.status === 'PASS') {
    steps.wasmBuild = run('cargo', ['build', '--release', '-p', 'coachlol-core-state', '--target', 'wasm32-unknown-unknown', '--offline']);
    const wasmPath = resolve(root, 'target/wasm32-unknown-unknown/release/coachlol_core_state.wasm');
    if (steps.wasmBuild.status === 'PASS' && existsSync(wasmPath)) {
      wasmSha256 = createHash('sha256').update(readFileSync(wasmPath)).digest('hex');
      steps.wasmSmoke = run(process.execPath, ['--test', 'tests/audit/m45_wasm_binary_smoke.test.mjs']);
    } else if (steps.wasmBuild.status === 'PASS') {
      steps.wasmBuild.status = 'FAIL';
      steps.wasmBuild.reason = 'compiler returned success but WASM binary is missing';
    }
  }
  const receipt = {
    schema: 'coachlol.m45.b02a.evidence.v1',
    generated_at: new Date().toISOString(),
    host: { platform: os.platform(), arch: os.arch(), node: process.version },
    toolchain, steps, wasm_sha256: wasmSha256,
    G1: gateG1(steps),
    warnings: [
      'adapter PASS is a mock ABI test, never native Rust or WASM',
      'G1 PASS_BASELINE_ONLY does not certify gameplay parity or full migration G8',
      'G2-G8 require independent match, security, browser and asset evidence',
    ],
  };
  if (receiptPath) writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ G1: receipt.G1, toolchain, statuses: Object.fromEntries(Object.entries(steps).map(([k, v]) => [k, v.status])), wasm_sha256: wasmSha256, receipt: receiptPath }, null, 2));
  if (Object.values(steps).some(step => step.status === 'FAIL')) process.exitCode = 1;
  else if (receipt.G1 !== 'PASS_BASELINE_ONLY') process.exitCode = 42;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) execute();
