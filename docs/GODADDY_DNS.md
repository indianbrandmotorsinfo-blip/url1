# GoDaddy DNS configuration

Point `myurls.yashwanthgowdam.in` at your OCI VM.

## 1. Add the A record

1. Sign in to GoDaddy and open **My Products → Domains → yashwanthgowdam.in → DNS** (or **Manage DNS**).
2. Click **Add New Record**.
3. Fill in:

| Field | Value |
|---|---|
| Type | `A` |
| Name | `myurls` |
| Value | your VM's public IP address |
| TTL | `600 seconds` (10 minutes) or the lowest option offered |

4. Click **Save**.

The Name is only `myurls`, not the full domain. GoDaddy adds `.yashwanthgowdam.in` for you.

If a record named `myurls` already exists (for example a `CNAME` or a "parked" `A` record), edit or delete it first. A name cannot have both a CNAME and an A record.

## 2. Wait and verify

DNS changes usually take a few minutes, sometimes up to an hour. Check from your computer:

```bash
dig +short myurls.yashwanthgowdam.in
```

Expected output: your VM's IP address, for example `203.0.113.25`. No `dig`? Use:

```bash
nslookup myurls.yashwanthgowdam.in
```

You can also compare with a public resolver to rule out caching:

```bash
dig +short myurls.yashwanthgowdam.in @8.8.8.8
```

**Do not request the SSL certificate until this returns your IP.** Let's Encrypt checks DNS and will refuse otherwise (see [SSL_SETUP.md](SSL_SETUP.md)).

## 3. Optional: IPv6

Only add an `AAAA` record if your VM has a working IPv6 address *and* ports 80/443 are open for IPv6. If unsure, skip it. A wrong `AAAA` record breaks the site for IPv6 visitors and fails certificate validation.

## Troubleshooting

- Returns nothing: the record is not saved yet, or the Name was typed as the full domain. It must be `myurls`.
- Returns a different IP: an old record is still there, or the TTL has not expired. Wait and retry.
