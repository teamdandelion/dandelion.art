# Deployment

The site is an Astro static build deployed with Cloudflare Workers Static
Assets. Cloudflare Workers Builds is connected to this GitHub repository.

Configure Workers Builds with:

- Production branch: `main`
- Build command: `npm run build`
- Production deploy command: `npx wrangler deploy`
- Preview deploy command: `npx wrangler versions upload`
- Root directory: `/`

Every pull request receives a versioned `workers.dev` preview URL from
Cloudflare's GitHub integration. A merge to `main` deploys the production
version. The custom domain is attached to the Worker in Cloudflare rather than
declared in `wrangler.toml`, so preview deployments cannot affect it.

The `Workers preview comment` workflow updates one pull request comment after
each Workers build, including the commit and branch preview URLs and a Pacific
time timestamp. It finds the pull request from the build's commit SHA, avoiding
a race when a branch is pushed immediately before its pull request is created.

The former Cloudflare Pages project has been retired. Do not reconnect Pages;
both preview and production deployments belong to the Worker.

Keep **Preview URLs** enabled under the Worker's **Domains** settings. A preview
build runs `wrangler versions upload`, which uploads a version but cannot enable
the Worker's preview-routing setting on its own.

For local verification, run `npm run preview:worker`. To deploy manually, run
`npm run deploy`; to upload a non-production preview version, run
`npm run deploy:preview`.
