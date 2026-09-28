# GitHub synchronization

Repository: https://github.com/mosish/polad-charkhesh

Branch: `main`. Remote: `origin`.

The active local checkout may be the main repository or an attached worktree. Check the current Git branch and working tree before changing or pushing files. The initial website upload is preserved in Git history.

After completing a requested change, review the diff, run appropriate checks, update the [README progress section](../README.md#progress) with the outcome and remaining work, commit the source and documentation together, and push to this repository. Synchronization is performed during project work, not continuously in the background.

Before a push, fetch remote changes and reconcile them without overwriting other work. Never force-push. If branch protection prevents a direct push, use a separate branch and draft pull request.

Source, documentation, assets, the lockfile, and `.env.example` belong in Git. Local credentials, the SQLite database, uploaded media, dependencies, build output and inactive reference files are excluded. Back up live database/uploads separately; GitHub does not contain admin accounts or saved runtime content.

Uploading source does not deploy or publish the running website.
