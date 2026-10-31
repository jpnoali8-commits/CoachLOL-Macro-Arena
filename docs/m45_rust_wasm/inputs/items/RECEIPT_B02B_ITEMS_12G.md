# M45 B12G — Portable Codespaces Rust cargo gate

2026-10-30. Branch `dev69/m45-audit-items`.

## Implemented
- Isolated safe Codespaces runner: `scripts/m45/qa_items_codespace.sh`; fetch audit branch and create temporary detached worktree; run the two Rust Cargo crate tests offline; rustfmt if installed; wasm32 check only when target already installed; logs under `~/coachlol-m45-qa/`. No branch switching, no merge, no GitHub Actions.
- Fix `AtomicShop` receipts after buy/sell/undo: `item_stats_pending=false` after the numeric basic item stats actually commit; raw `ShopUnit` receipts still indicate pending. This does NOT attest passive item proc coverage. Added 1 Rust test, not executed.

## One-line Codespaces execution, at the repository terminal

```bash
git fetch --no-tags origin dev69/m45-audit-items && git show origin/dev69/m45-audit-items:scripts/m45/qa_items_codespace.sh | bash
```

Output: the terminal prints `QA_LOG_DIR`; read its `gates.txt` and failed `.log` files. **Native test status remains NOT_RUN in this chat** because the connected GitHub API cannot execute a terminal in the user Codespace, and this chat container has no cargo/rustc. Do not claim Cargo PASS or G8 until logs and match integration are inspected. Actions 0.
