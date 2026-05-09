# Stoic Reader

1. `npm install`
2. Add source texts to `scripts/source.txt` and `scripts/sources/`
3. `npm run parse`
4. `npm run build && npm run preview`

## Deployment

Pushes to `main` deploy to Cloudflare with GitHub Actions.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Local deploys use `npm run deploy`.
