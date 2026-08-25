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

For local verification, run `npm run preview:worker`. To deploy manually, run
`npm run deploy`; to upload a non-production preview version, run
`npm run deploy:preview`.
