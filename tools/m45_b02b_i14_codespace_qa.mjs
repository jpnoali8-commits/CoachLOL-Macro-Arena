#!/usr/bin/env node
// M45 B02B-I14. Execute locally in Codespaces. NEVER invokes GitHub Actions.
// Runs actual local processes, records separate exit codes and keeps logs private.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, createWriteStream, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = join(root, '.m45-qa', 'i14');
mkdirSync(reportDir, { recursive: true });
function info(program, args) {
  const r = spawnSync(program, args, { cwd: root, encoding: 'utf8', timeout: 6000 });
  return r.status === 0 ? (r.stdout || '').trim() : null;
}
const report = {
  schema: 'coachlol.m45.b02b.i14.codespace-native-qa.v1',
  head: info('git', ['rev-parse', 'HEAD']),
  branch: info('git', ['branch', '--show-current']),
  expected_branch: 'dev69/rust-core-m45',
  local_only: true, github_actions_triggered_by_runner: 0,
  network_downloads: 0,
  versions: {
    node: process.version, cargo: info('cargo', ['--version']),
    rustc: info('rustc', ['--version']),
    rustfmt: info('cargo', ['fmt', '--version']),
    clippy: info('cargo', ['clippy', '--version']),
    rustup: info('rustup', ['--version']),
  },
  checks: {},
};
const output = join(reportDir, 'result.json');
function setStatus(name, status, reason) {
  report.checks[name] = { status, ...(reason ? { reason } : {}) };
}
function writeReport() {
  const states = Object.values(report.checks).map(x => x.status);
  report.status = states.includes('FAIL') ? 'FAIL' :
    states.includes('BLOCKED') ? 'INCOMPLETE_BLOCKED' :
    states.includes('SKIPPED') ? 'INCOMPLETE_SKIPPED' :
    'PASS_LOCAL_ONLY_NO_CERTIFICATION';
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log('\nM45 I14: ' + report.status);
  console.log('Receipt: ' + relative(root, output));
  for (const [key, value] of Object.entries(report.checks))
    console.log('  ' + key + ': ' + value.status +
      (value.reason ? ' (' + value.reason + ')' : ''));
}
async function run(name, program, args) {
  console.log('RUN ' + name + ': ' + program + ' ' + args.join(' '));
  const logPath = join(reportDir, name + '.log');
  const stream = createWriteStream(logPath, { flags: 'w' });
  let exitCode = null, error = null;
  await new Promise(done => {
    const proc = spawn(program, args, { cwd: root, shell: false });
    proc.stdout.pipe(stream, { end: false });
    proc.stderr.pipe(stream, { end: false });
    proc.on('error', e => { error = e.message; done(); });
    proc.on('close', code => { exitCode = code; done(); });
  });
  await new Promise(done => stream.end(done));
  report.checks[name] = {
    status: error || exitCode !== 0 ? 'FAIL' : 'PASS',
    exit_code: exitCode, ...(error ? { error } : {}),
    log: relative(root, logPath),
  };
  if (name === 'rust_unit_tests') {
    const log = readFileSync(logPath, 'utf8');
    report.checks[name].passed_test_summary_counts = Array.from(
      log.matchAll(/test result: ok\. (\d+) passed;/g),
      match => Number(match[1]),
    );
  }
  console.log(report.checks[name].status + ' ' + name);
}
if (!report.head || report.branch !== report.expected_branch) {
  setStatus('checkout', 'BLOCKED', 'fetch and switch to dev69/rust-core-m45');
  writeReport();
  process.exitCode = 2;
} else {
  setStatus('checkout', 'PASS');
  await run('node_source_contract', 'node', [
    '--test', 'tests/audit/m45_b02b_i13_source_audit.test.mjs',
  ]);
  await run('node_m45_audits', 'node', [
    '--test',
    'tests/audit/m45_b02b_i13_source_audit.test.mjs',
    'tests/audit/m45_b02_legacy_smite_snapshot.test.mjs',
    'tests/audit/m45_b02_public_adapter_contract.test.mjs',
    'tests/audit/m45_b02b_gateway_kit_receipt.test.mjs',
    'tests/audit/m45_b02b_handoff_integrity.test.mjs',
    'tests/audit/m45_b02b_nami_w_receipt.test.mjs',
    'tests/audit/m45_qa_evidence_policy.test.mjs',
    'tests/audit/v453_m45_rust_golden_js_pvp.test.mjs',
  ]);
  if (!(report.versions.cargo && report.versions.rustc)) {
    for (const step of ['rust_unit_tests', 'rust_fmt', 'rust_clippy', 'wasm_build', 'wasm_smoke'])
      setStatus(step, 'BLOCKED', 'cargo or rustc missing; install official rustup in Codespace');
  } else {
    await run('rust_unit_tests', 'cargo', [
      'test', '--workspace', '--all-targets', '--offline',
    ]);
    if (report.versions.rustfmt)
      await run('rust_fmt', 'cargo', ['fmt', '--all', '--', '--check']);
    else setStatus('rust_fmt', 'BLOCKED', 'rustup component add rustfmt');
    if (report.versions.clippy)
      await run('rust_clippy', 'cargo', [
        'clippy', '--workspace', '--all-targets', '--offline', '--', '-D', 'warnings',
      ]);
    else setStatus('rust_clippy', 'BLOCKED', 'rustup component add clippy');
    const targets = info('rustup', ['target', 'list', '--installed']);
    if (targets?.split('\n').includes('wasm32-unknown-unknown')) {
      await run('wasm_build', 'cargo', [
        'build', '--release', '-p', 'coachlol-core-state',
        '--target', 'wasm32-unknown-unknown', '--offline',
      ]);
      if (report.checks.wasm_build.status === 'PASS')
        await run('wasm_smoke', 'node', [
          '--test', 'tests/audit/m45_wasm_binary_smoke.test.mjs',
        ]);
      else setStatus('wasm_smoke', 'SKIPPED', 'WASM build failed');
    } else {
      setStatus('wasm_build', 'BLOCKED',
        'rustup target add wasm32-unknown-unknown');
      setStatus('wasm_smoke', 'BLOCKED', 'WASM target unavailable');
    }
  }
  writeReport();
  if (report.status !== 'PASS_LOCAL_ONLY_NO_CERTIFICATION') process.exitCode = 1;
}
