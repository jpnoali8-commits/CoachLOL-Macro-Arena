#!/usr/bin/env bash
# One-shot Codespaces startup QA: no polling, merges, branch checkout, or pushes
# to production. Evidence publication uses the separate opt-in Node publisher.
set -Eeuo pipefail
if [[ "${CODESPACES:-false}" != "true" ]]; then
 echo 'CoachLOL QA autostart: not Codespaces, skipping.'; exit 0
fi
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
case "$(git remote get-url origin)" in
 *jpnoali8-commits/CoachLOL-Macro-Arena*) ;;
 *) echo 'CoachLOL QA: refusing unrelated repository' >&2;exit 2;;
esac
CACHE="${HOME}/.cache/coachlol-qa"
OUT="${HOME}/coachlol-qa-reports"
mkdir -p "$CACHE" "$OUT"
# Lock prevents two VS Code attachments from racing; it never polls.
command -v flock >/dev/null || { echo 'flock not available' >&2;exit 2; }
exec 9>"$CACHE/running.lock"
flock -n 9 || { echo 'CoachLOL QA already running; skip duplicate.';exit 0; }
command -v node >/dev/null || { echo 'Node 22 missing' >&2;exit 2; }
[[ "$(node -p 'process.versions.node.split(".")[0]')" == 22 ]] ||
 { echo 'Expected Node.js 22 in devcontainer' >&2;exit 2; }
# Fingerprint of the *remote* branch heads; no changes to active local branches.
REMOTE_REFS="$CACHE/remote-refs.tmp"
git ls-remote --heads origin \
 refs/heads/dev69/integration \
 refs/heads/dev69/skills-batch2 \
 refs/heads/dev69/items-batch7 \
 refs/heads/ops/qa-orchestrator-dev69 | sort > "$REMOTE_REFS"
[[ "$(wc -l < "$REMOTE_REFS")" -eq 4 ]] ||
 { echo 'Missing remote QA branch head; no false PASS.' >&2;exit 2; }
SIGNATURE="$(sha256sum "$REMOTE_REFS" | cut -d' ' -f1)"
if [[ -f "$CACHE/last-passed-heads" &&
 "$(cat "$CACHE/last-passed-heads")" == "$SIGNATURE" ]]; then
 echo 'CoachLOL QA: unchanged SHA fingerprint already passed; no duplicate run.'
 exit 0
fi
# Fetch the separate infrastructure branch, then run it in a detached
# worktree. The Codespace's own branch and uncommitted files remain untouched.
git fetch --no-tags origin \
 '+refs/heads/ops/qa-orchestrator-dev69:refs/remotes/origin/ops/qa-orchestrator-dev69'
SCRATCH="$(mktemp -d -t coachlol-qa-start-XXXXXXXX)"
WORKTREE="$SCRATCH/infra"
cleanup(){
 if [[ -d "$WORKTREE" ]];then
   git -C "$ROOT" worktree remove --force "$WORKTREE" || true
 fi
 rm -rf "$SCRATCH"
}
trap cleanup EXIT
git worktree add --detach "$WORKTREE" refs/remotes/origin/ops/qa-orchestrator-dev69
set +e
(cd "$WORKTREE" && node tools/qa/offline_full_project.mjs --quick)
QA_RC=$?
set -e
if [[ -d "$WORKTREE/qa-reports" ]];then
 mkdir -p "$OUT"
 cp -a "$WORKTREE/qa-reports/." "$OUT/"
fi
if [[ -f "$WORKTREE/qa-reports/latest.json" &&
 "${COACHLOL_QA_AUTO_PUBLISH:-0}" == "1" ]];then
 (cd "$WORKTREE" && node tools/qa/publish_report.mjs \
   "$WORKTREE/qa-reports/latest.json") ||
   echo 'WARNING: evidence upload failed; local logs retained in coachlol-qa-reports.' >&2
fi
if [[ "$QA_RC" == 0 ]];then
 echo "$SIGNATURE" > "$CACHE/last-passed-heads"
 echo 'CoachLOL quick PASS_LANES. No release certification claimed.'
else
 echo 'CoachLOL quick FAIL/BLOCKED. SHA cache unchanged; will retry after restart.' >&2
fi
echo "QA reports saved: $OUT"
exit "$QA_RC"
