# Development workflow

- Never develop directly on `main`. Create focused branches and merge through pull requests.
- Use GitHub's native stacked pull requests for dependent changes. The bottom branch targets `main`; create each dependent layer with `gh stack add <branch>`.
- Keep each layer independently reviewable and put dependencies in the same or a lower layer.
- Before publishing, run the relevant formatting, build, and test checks.
- Publish or update the whole stack with `gh stack submit`. Avoid manually changing PR base branches.
- When a lower layer changes, run `gh stack rebase` and `gh stack push` so every higher layer remains linear.
- Merge stacks from the bottom up with `gh stack merge`. After merges, run `gh stack sync` before continuing work.
- Do not force-push, manually rebase published stack branches, or bypass required checks unless the user explicitly asks.
