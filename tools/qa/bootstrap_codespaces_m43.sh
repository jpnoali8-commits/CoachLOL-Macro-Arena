#!/usr/bin/env bash
# CoachLOL: disable Actions, set Node 22, bundle all refs, snapshot game, then run isolated QA.
# Never merges, commits, pushes, resets, or deletes source branches.
set -Eeuo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
REPO='jpnoali8-commits/CoachLOL-Macro-Arena'
case "$(git remote get-url origin)" in
  *github.com/jpnoali8-commits/CoachLOL-Macro-Arena*|*github.com:jpnoali8-commits/CoachLOL-Macro-Arena*) ;;
  *) echo 'ERRO: Codespaces nao corresponde ao repositorio CoachLOL.' >&2; exit 2;;
esac
fail(){ echo "ERRO: $*" >&2; exit 1; }
echo '1/5 GitHub Actions: verificar e desligar antes de novos commits'
command -v gh >/dev/null || fail 'Instale gh CLI ou desative Actions em Settings > Actions > General.'
ENABLED="$(gh api "repos/$REPO/actions/permissions" --jq '.enabled')" || fail 'Sem acesso ao status do GitHub Actions.'
if [[ "$ENABLED" != 'false' ]]; then
  gh api --method PUT "repos/$REPO/actions/permissions" -F enabled=false || fail 'Sem permissao para desligar Actions: use Settings > Actions > General > Disable actions.'
fi
[[ "$(gh api "repos/$REPO/actions/permissions" --jq '.enabled')" == false ]] || fail 'Actions nao confirmado como desabilitado.'
echo 'Actions confirmado enabled=false.'

echo '2/5 Node.js 22'
if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
  source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm install 22 && nvm use 22
fi
[[ "$(node -p 'process.versions.node.split(".")[0]')" == 22 ]] || fail 'Node 22 ausente: use .devcontainer da branch ops.'
node --version
if [[ -f package-lock.json ]]; then npm ci --ignore-scripts --no-audit --no-fund; fi

echo '3/5 Capturar todas as branches e criar Git bundle'
git fetch origin '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*'
OUT="${COACHLOL_BACKUP_DIR:-$HOME/coachlol-backups}/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT/snapshots" "$OUT/jogo-M43"
git for-each-ref --format='%(refname) %(objectname)' refs/heads refs/remotes refs/tags > "$OUT/refs.txt"
git status --porcelain --untracked-files=all > "$OUT/trabalho_nao_commitado.txt"
git bundle create "$OUT/CoachLOL_HISTORICO_GIT_COMPLETO.bundle" --all
git bundle verify "$OUT/CoachLOL_HISTORICO_GIT_COMPLETO.bundle"
: > "$OUT/submodulos.txt"
: > "$OUT/branches_ausentes.txt"
for branch in main dev69/integration dev69/skills-batch2 dev69/items-batch7 dev69/assets-import dev69/assets-chunks-stage dev69/qa-candidate ops/offline-qa-dev69; do
  ref="refs/remotes/origin/$branch"
  if git show-ref --verify --quiet "$ref"; then
    echo "Backup snapshot: $branch"
    git archive --format=zip --output="$OUT/snapshots/${branch//\//__}.zip" "$ref"
    git ls-tree -r "$ref" | awk -v b="$branch" '$1=="160000"{print b,$0}' >> "$OUT/submodulos.txt"
  else echo "$branch" >> "$OUT/branches_ausentes.txt"; fi
done
git archive refs/remotes/origin/dev69/skills-batch2 | tar -xf - -C "$OUT/jogo-M43"

echo '4/5 Verificar LFS, integrity zip, manifestos e SHA256'
if git lfs version >/dev/null 2>&1; then
  git lfs ls-files --all > "$OUT/lfs.txt" || true
  if [[ -s "$OUT/lfs.txt" ]]; then
    git lfs fetch --all origin || fail 'Objetos LFS remotos incompletos.'
    dir="$(git rev-parse --path-format=absolute --git-common-dir)"
    [[ -d "$dir/lfs/objects" ]] || fail 'LFS detectado sem objetos baixados.'
    tar -czf "$OUT/CoachLOL_LFS_OBJETOS.tar.gz" -C "$dir/lfs" objects
  fi
else echo 'Git LFS nao instalado: verificar ponteiros LFS manualmente.' > "$OUT/lfs.txt"; fi
cat > "$OUT/LEIA_PRIMEIRO.txt" <<'TXT'
O .bundle restaura todos os refs Git (incluindo branches nao listadas nos snapshots).
O jogo-M43/ vem da branch Skills e NAO e a integracao final de Items/Logic.
Os ZIPs individuais representam branches diferentes; nao fazer merge automatico.
O bundle/git archive nao inclui arquivos locais nao commitados nem assets nao enviados ao GitHub.
Revise trabalho_nao_commitado.txt, lfs.txt, submodulos.txt e branches_ausentes.txt.
TXT
(cd "$OUT" && sha256sum ./*.bundle ./snapshots/*.zip > SHA256SUMS.txt)
ZIP="$OUT/CoachLOL_BACKUP_M43_TODAS_BRANCHES.zip"
(cd "$OUT" && shopt -s nullglob && zip -qr "$ZIP" jogo-M43 snapshots ./*.bundle ./*.txt ./*.tar.gz)
unzip -tqq "$ZIP"
sha256sum "$ZIP" > "$OUT/ZIP_SHA256.txt"
echo "Backup verificado: $ZIP"

echo '5/5 QA QUICK: integration + Skills M42/M43 + Items Batch7, sem Actions'
TMP="$(mktemp --suffix=.mjs)"
trap 'rm -f "$TMP"' EXIT
git show refs/remotes/origin/ops/offline-qa-dev69:tools/qa/offline_full_project.mjs > "$TMP"
node "$TMP" --quick
printf '\nQA quick concluiu. Bundle e ZIP: %s\n' "$OUT"
echo 'QA --full: git show origin/ops/offline-qa-dev69:tools/qa/offline_full_project.mjs > /tmp/coachlol-qa.mjs && node /tmp/coachlol-qa.mjs --full'
