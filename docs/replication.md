# Secure repository replication

The dashboard can queue a mirror replication between two GitHub HTTPS repositories using `POST /api/replicate`.

## Security model

- The route accepts only `https://github.com/<owner>/<repo>.git` URLs.
- Never include access tokens, passwords, or SSH keys in repository URLs.
- Credentials should be provided by a server-side Git credential helper or deployment secret configured outside the browser.
- The worker uses `execFile` argument arrays, a timeout, non-interactive Git, bounded output, and temporary-directory cleanup.
- Job state is currently process-local and is intended for preview/single-instance use; use a durable queue and database before multi-instance production workloads.

## API

`POST /api/replicate`

```json
{
  "sourceUrl": "https://github.com/example/source.git",
  "targetUrl": "https://github.com/example/target.git"
}
```

The API returns `202 Accepted` with a `jobId`. Poll `GET /api/replicate?jobId=<jobId>` for status.

The operation mirrors branches and tags. It does not perform shipment operations and does not expose credentials to the client.
