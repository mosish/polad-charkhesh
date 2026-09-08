# GitHub synchronization

Repository: https://github.com/mosish/polad-charkhesh

Branch: `main`. Remote: `origin`.

The active local Git repository is the website source directory (`outputs/site` in the Codex workspace). The user's initial upload is preserved in the Git history.

After completing a requested change, Codex reviews the diff, runs appropriate checks, commits the source and pushes to this repository. Future sessions should follow the root `AGENTS.md`. Synchronization is performed during project work, not continuously in the background.

Before a push, fetch remote changes and reconcile them without overwriting other work. Never force-push. If branch protection prevents a direct push, use a separate branch and draft pull request.

Source, documentation, assets, the lockfile, and `.env.example` belong in Git. Local credentials, the SQLite database, uploaded media, dependencies, build output and inactive reference files are excluded. Back up live database/uploads separately; GitHub does not contain admin accounts or saved runtime content.

Uploading source does not deploy or publish the running website.
