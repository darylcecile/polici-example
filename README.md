# Polici Example

This repository is a minimal working example of [Polici](https://github.com/darylcecile/polici) in GitHub Actions and VS Code.

## What It Enforces

[`ci.pol`](ci.pol) checks every pull request against two rules:

- JSON service records under `data/services/` must have unique IDs.
- Every service owner must be recognized by the custom `ownership@1` provider.
- Pull requests may change only Markdown documentation or service records.

The workflow always installs the immutable `polici@1.0.0` npm release. Polici loads `ci.pol` and `polici.lock` from the trusted pull-request base commit, evaluates the exact head tree, and obtains changed-file information from the built-in GitHub provider.

## Custom Plugin

[`plugins/ownership/manifest.json`](plugins/ownership/manifest.json) is a static plugin contract. It exports `Ownership.approved(owner)`, which the policy calls for every service record.

[`plugins/ownership/runtime.ts`](plugins/ownership/runtime.ts) is the TypeScript source. CI executes the precompiled `runtime-linux-x64` artifact; Polici verifies both its SHA-256 and the canonical manifest digest from `polici.lock` before launch. The workflow uses `--trust-plugin ownership@1` to make this reviewed base-owned executable part of the workflow trusted computing base.

Rebuild and relock it from a trusted Linux x64 environment:

```sh
npx --yes scriptc@0.0.33 build plugins/ownership/runtime.ts \
  --no-keep-c \
  -o plugins/ownership/runtime-linux-x64

polici lock \
  --repository . \
  --file ci.pol \
  --lockfile polici.lock \
  --plugin plugins/ownership/manifest.json
```

## GitHub Actions

The complete workflow is [`.github/workflows/polici.yml`](.github/workflows/polici.yml). It uses read-only GitHub permissions and a checkout action pinned to its full commit SHA.

To see it pass, open a pull request that changes this README or adds a uniquely identified JSON record under `data/services/`.

To see it fail, open a pull request that changes an unrelated path or duplicates an existing service ID.

## Local Usage

Install the published CLI:

```sh
npm install --global polici@1.0.0
```

The GitHub-backed policy is designed for pull-request events. A core-only local syntax and type check can still be run with:

```sh
polici validate --file ci.pol --lockfile polici.lock
```

## VS Code

Opening this repository in VS Code recommends the published `polici.polici-language` extension through [`.vscode/extensions.json`](.vscode/extensions.json). The workspace settings start the installed `polici` binary as a language server and point it at `polici.lock`.

If Marketplace propagation is still pending, install the same released VSIX directly:

```sh
curl --fail --location --output polici-language.vsix \
  https://github.com/darylcecile/polici/releases/download/v1.0.0/polici-language.vsix
code --install-extension polici-language.vsix
```
