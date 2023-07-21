!> hide

<head>
    <title>Reverse proxy | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Kvarn reverse proxy details.">
</head>

Kvarn's reverse proxy implementation allows pass through of web servers'
responses.

> On the git version of Kvarn, URL rewrite is implemented, and automatically
> applied.

It can for instance pass all requests under `/api/*` to a backend server. It
caches according to the `cache-control` and
[`kvarn-cache-control`](https://doc.kvarn.org/kvarn/prelude/parse/struct.CacheControl.html#method.from_kvarn_cache_control)
headers. `/api/search?q=icelk` becomes a request to `/search?q=icelk` on the
backend server.

This implementation is used by me for proxying my self-hosted Bitwarden vault
(using Vaultwarden, of course) to the internet.

# Usage

You start with constructing a
[manager](https://doc.kvarn.org/kvarn_extensions/reverse_proxy/struct.Manager.html).
I recommend using
[`static_connection`](https://doc.kvarn.org/kvarn_extensions/reverse_proxy/fn.static_connection.html)
and
[`localhost`](https://doc.kvarn.org/kvarn_extensions/reverse_proxy/fn.localhost.html)
and the
[`Manager::base`](https://doc.kvarn.org/kvarn_extensions/reverse_proxy/struct.Manager.html#method.base)
constructor.

Consider
[`Manager::new`](https://doc.kvarn.org/kvarn_extensions/reverse_proxy/struct.Manager.html#method.new)
for more control.

Then, mount it to your extensions using
[`Manager::mount`](https://doc.kvarn.org/kvarn_extensions/reverse_proxy/struct.Manager.html#method.mount).
