# AWS setup (Wild Child CMS)

The public site loads CMS JSON from S3 over HTTPS (**`locations-content.json`**, **`about-content.json`**, **`media-content.json`**, etc.). The admin UI at **`/admin`** signs in through a **Lambda Function URL** and saves those files with **`s3:PutObject`**. This matches the pattern used in the **rivers-of-fire** project (Function URL auth NONE, JWT session, public S3 reads).

---

## 1. S3 bucket (`wild-child-cms`)

### Object to host

- **Key:** `locations-content.json` (at the bucket root unless you override `CMS_S3_LOCATIONS_KEY` on Lambda).
- **Starting content:** Copy from `src/content/defaultLocationsContent.json` in this repo.

Shape:

```json
{
  "version": 1,
  "regionsNotice": "Proudly serving the following regions: …"
}
```

### Bucket policy (public read for this file)

Allow anonymous **`s3:GetObject`** on the CMS JSON only. Replace the bucket name if yours differs.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadLocationsContent",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wild-child-cms/locations-content.json"
    }
  ]
}
```

**Block Public Access:** For this policy to take effect, the bucket must allow public access via policy (in **S3 → Permissions → Block public access**, adjust settings so a public bucket policy is not blocked). Confirm the object opens in a browser:

`https://wild-child-cms.s3.<region>.amazonaws.com/locations-content.json`

### CORS configuration (attach to the bucket)

So the **browser** on your site (and local dev) can `fetch` the JSON, add a CORS rule on the bucket.

**Option A — Explicit origins (recommended for production):** List each exact origin (no trailing slash): production URL, `www` if used, and local dev.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "https://main.YOURAPPID.amplifyapp.com",
      "https://www.yourdomain.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

Replace the Amplify hostname with the value from **Amplify → Hosting** (each preview branch has its own origin; add those if you use previews).

**Option B — Wildcard (simpler for many preview URLs):** JSON is public read-only; some teams use:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

In the AWS console: **S3 → Bucket → Permissions → Cross-origin resource sharing (CORS) → Edit** → paste one of the JSON arrays above.

### Frontend default URL

The app defaults to:

`https://wild-child-cms.s3.us-east-1.amazonaws.com/locations-content.json`

If your bucket is in another region, set **`REACT_APP_LOCATIONS_CONTENT_URL`** at build time to the correct virtual-hosted–style URL, or change the default in `src/content/locationsContent.js`.

### About page (`about-content.json`)

- **Key:** `about-content.json` (unless you set **`CMS_S3_ABOUT_KEY`** on Lambda).
- **Starting content:** Copy from `src/content/defaultAboutContent.json`.

Shape (abbreviated):

```json
{
  "version": 1,
  "pageHeader": "About the Artist & Company",
  "mainText": "…",
  "listIntro": "…",
  "items": [{ "title": "…", "body": "…" }]
}
```

**Bucket policy:** Add a **`GetObject`** statement for this object (same pattern as locations). Example **combined** policy for locations, about, media, bridal, and pages CMS files:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadLocationsContent",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wild-child-cms/locations-content.json"
    },
    {
      "Sid": "PublicReadAboutContent",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wild-child-cms/about-content.json"
    },
    {
      "Sid": "PublicReadMediaContent",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wild-child-cms/media-content.json"
    },
    {
      "Sid": "PublicReadBridalContent",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wild-child-cms/bridal-content.json"
    },
    {
      "Sid": "PublicReadPagesContent",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wild-child-cms/pages-content.json"
    }
  ]
}
```

Default public URL pattern:

`https://wild-child-cms.s3.us-east-1.amazonaws.com/about-content.json`

Override with **`REACT_APP_ABOUT_CONTENT_URL`** at build time if needed, or edit the default in `src/content/aboutContent.js`.

### TV. Film. Print. page (`media-content.json`)

- **Key:** `media-content.json` (unless you set **`CMS_S3_MEDIA_KEY`** on Lambda).
- **Starting content:** Copy from `src/content/defaultMediaContent.json`.

The JSON includes the page title, intro, section titles/bodies, repeatable “highlight” cards, rate cards, client groups, and selected-work copy. The **header banner image** stays in the repo (`src/assets/page-headers/`), not in S3.

Default public URL pattern:

`https://wild-child-cms.s3.us-east-1.amazonaws.com/media-content.json`

Override with **`REACT_APP_MEDIA_CONTENT_URL`** at build time if needed, or edit the default in `src/content/mediaContent.js`.

### Bridal pages (`bridal-content.json`)

- **Key:** `bridal-content.json` (unless you set **`CMS_S3_BRIDAL_KEY`** on Lambda).
- **Starting content:** Copy from `src/content/defaultBridalContent.json`.

The JSON holds **overview** (main bridal landing), **services** breakdown, and regional copy for **Pittsburgh** and **Atlanta** (packages, add-ons, CTAs). Gallery/reviews on the overview page are not CMS-driven.

Default public URL pattern:

`https://wild-child-cms.s3.us-east-1.amazonaws.com/bridal-content.json`

Override with **`REACT_APP_BRIDAL_CONTENT_URL`** at build time if needed, or edit the default in `src/content/bridalContent.js`.

### Beauty, Classes, Creative & FX, FAQ (`pages-content.json`)

- **Key:** `pages-content.json` (unless you set **`CMS_S3_PAGES_KEY`** on Lambda).
- **Starting content:** Copy from `src/content/defaultPagesContent.json`.

One JSON document holds copy for **Beauty & Events** (`/beauty-events`), **Classes** (`/classes`), **Creative & FX** (`/creative-fx`), and **FAQ** (`/faq`). FX gallery images remain in the repo.

Default public URL pattern:

`https://wild-child-cms.s3.us-east-1.amazonaws.com/pages-content.json`

Override with **`REACT_APP_PAGES_CONTENT_URL`** at build time if needed, or edit the default in `src/content/pagesContent.js`.

---

## 2. Lambda (`lambda/admin-auth`)

### Build the deployment zip

From the **repository root**:

```bash
npm run package:lambda
```

This writes **`dist/lambda-admin-auth.zip`** (`index.mjs` + `node_modules`). Upload this artifact to AWS when the Lambda code or its dependencies change.

### Runtime

- **Runtime:** Node.js **20.x** (18+ supported).
- **Handler:** `index.handler`.
- **Architecture:** Match the zip (typically **x86_64**).

### Environment variables

| Variable                 | Required | Purpose |
|--------------------------|----------|---------|
| `ADMIN_PASSWORD`       | Yes      | Shared admin password (server only; not in git). |
| `ADMIN_SESSION_SECRET` | Yes      | Long random string; signs JWTs (~24h sessions). |
| `CMS_S3_BUCKET`        | Yes      | e.g. `wild-child-cms`. |
| `CMS_S3_LOCATIONS_KEY` | No       | Defaults to `locations-content.json`. |
| `CMS_S3_ABOUT_KEY`     | No       | Defaults to `about-content.json`. |
| `CMS_S3_MEDIA_KEY`     | No       | Defaults to `media-content.json`. |
| `CMS_S3_BRIDAL_KEY`    | No       | Defaults to `bridal-content.json`. |
| `CMS_S3_PAGES_KEY`     | No       | Defaults to `pages-content.json`. |

### IAM (execution role)

Grant **`s3:PutObject`** on each CMS JSON object the admin can save (and **`s3:GetObject`** only if you later add reads in Lambda):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": [
        "arn:aws:s3:::wild-child-cms/locations-content.json",
        "arn:aws:s3:::wild-child-cms/about-content.json",
        "arn:aws:s3:::wild-child-cms/media-content.json",
        "arn:aws:s3:::wild-child-cms/bridal-content.json",
        "arn:aws:s3:::wild-child-cms/pages-content.json"
      ]
    }
  ]
}
```

Adjust bucket or keys if you use non-default names.

### Function URL

1. **Create function URL** → **Auth type: NONE** (the SPA sends `Authorization: Bearer …`; do **not** use AWS_IAM auth for browser calls).
2. **CORS** (configure **only** on the Function URL — this handler does not set `Access-Control-*` headers in code; duplicate CORS breaks browsers):

   - **Allow methods:** `GET`, `POST`, `PUT`, `OPTIONS`
   - **Allow headers:** `content-type`, `authorization`
   - **Allow origins:** your production site origin(s) and `http://localhost:3000` for local Create React App admin testing

### HTTP routes the app uses

- `POST {origin}/login` — body `{ "password": "…" }` → `{ "token": "…" }`
- `GET {origin}/verify` — header `Authorization: Bearer <token>`
- `PUT {origin}/locations-content` — header `Authorization: Bearer <token>`, body full JSON document `{ version, regionsNotice }`
- `PUT {origin}/about-content` — header `Authorization: Bearer <token>`, body full JSON document `{ version, pageHeader, mainText, listIntro, items }`
- `PUT {origin}/media-content` — header `Authorization: Bearer <token>`, body full **media** document (see `src/content/defaultMediaContent.json`)
- `PUT {origin}/bridal-content` — header `Authorization: Bearer <token>`, body full **bridal** document (see `src/content/defaultBridalContent.json`)
- `PUT {origin}/pages-content` — header `Authorization: Bearer <token>`, body full **pages** document (see `src/content/defaultPagesContent.json`)

Copy the Function URL **origin only** (no path), e.g.  
`https://xxxxxxxx.lambda-url.us-east-1.on.aws`

---

## 3. Frontend (Amplify / env)

Set at **build time** (Create React App bakes in `REACT_APP_*`):

| Variable                           | Purpose |
|------------------------------------|---------|
| `REACT_APP_ADMIN_AUTH_URL`        | Lambda Function URL origin (no trailing slash). **Required** for `/admin`. |
| `REACT_APP_LOCATIONS_CONTENT_URL` | Optional override for public JSON URL if not the default in code. |
| `REACT_APP_ABOUT_CONTENT_URL`    | Optional override for `about-content.json` if not the default in code. |
| `REACT_APP_MEDIA_CONTENT_URL`    | Optional override for `media-content.json` if not the default in code. |
| `REACT_APP_BRIDAL_CONTENT_URL`   | Optional override for `bridal-content.json` if not the default in code. |
| `REACT_APP_PAGES_CONTENT_URL`   | Optional override for `pages-content.json` if not the default in code. |

Local development: copy `.env.example` to `.env.local` and fill in values.

### SPA routing

Ensure `/admin` serves **`index.html`** (same rewrite as other client routes), e.g. in Amplify **Rewrites and redirects**.

---

## 4. Operational notes

- **Caching:** Writes set `Cache-Control: max-age=30` on the object; browsers or CloudFront may still cache briefly after edits.
- **Security:** Admin password and `ADMIN_SESSION_SECRET` live only in Lambda configuration; never commit them.
