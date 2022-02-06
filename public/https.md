!> hide

<head>
    <title>HTTPS | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="HTTPS implementation in the Kvarn web server. Info regarding Rustls.">
</head>

Unsecure HTTP should never be used. It opens up a motherload of fun security volubilities.
Using [Let's encrypt](https://letsencrypt.org/) and Kvarn, you can easily set up a secure HTTPS server.

Kvarn uses [ring](https://github.com/briansmith/ring) through [Rustls](https://github.com/rustls/rustls). It's been [audited](https://cure53.de/pentest-report_rustls.pdf) with great results - code quality was considered excellent.

# Protocols

Kvarn only accepts secure protocols. That excludes SSL and TLS versions *before* 1.2.

# Setup

When creating a [host](https://doc.kvarn.org/kvarn/host/struct.Host.html#method.new), you need to supply a certificate and private key.

If you have PEM encoded keys, you can use the function [`try_read_fs`](https://doc.kvarn.org/kvarn/host/struct.Host.html#method.try_read_fs).
