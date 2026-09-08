# Website workflow

This directory is the active website source and Git repository.

- The user authorized synchronizing completed project changes to `https://github.com/mosish/polad-charkhesh.git`, remote `origin`, branch `main`.
- After each requested change, run appropriate checks, review the source diff, commit the completed work and push. Do not ask for repeated permission for routine sync.
- Fetch and preserve remote work; never force-push or bypass branch protection. Use a branch and draft pull request if direct updates are protected.
- Exclude local credentials, `.env`, databases, uploaded media, dependencies, generated builds, temporary work, and source archives. Keep `.env.example` and the dependency lockfile.
- Preserve the local website and admin data. This repository holds application source, not the live data backup.
- Verify a successful push and state any synchronization blocker accurately.
- This workflow runs while working on the project; it is not a background file watcher and does not authorize deploying the website.
