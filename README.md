# The Scrub Doctors

Marketing site for The Scrub Doctors LLC — premium pure-water window cleaning
serving the Main Line, South Jersey, and Northern Delaware.

Static site (`index.html` + `styles.css` + `app.js` + `assets/`), served on
Railway via Caddy (`Dockerfile` + `Caddyfile`). `railway.json` pins the
Dockerfile builder.

Built from a Claude Design handoff. Deploys are CLI-based:
`railway up --ci` from this directory.
