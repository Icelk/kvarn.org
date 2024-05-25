!> hide

<head>
    <title>Request pipeline | Kvarn</title>
    <meta name="permalinks" content="enabled">
</head>

This document will contain all information about how incoming requests are
handled in Kvarn.

This is here to make development easier; to have a clear plan of what to do,
where to implement it, and the branching of functions.

# Layer 1 / Transport

This is the layer managing the transport layer of the connections. Currently,
it's not implemented, but that should be easy (said that before, haven't you?).

This is needed for HTTP/3 with its QUIC protocol.

TCP will not get effected.

# Layer 2 / Encryption

This is where encryption takes place, or not. TLS will be processed here.

Unencrypted HTTP will be passed through.

Request is still a stream.

# Layer 3 / HTTP

This is where all HTTP versions (1, 2 and 3) are managed to give a common API.

Here, the compressed headers of HTTP/2 and HTTP/3 are resolved.

Body still stream (at least kinda, see
[`application.rs#Body`](https://doc.kvarn.org/kvarn/application/enum.Body.html)
for more info). Headers are parsed.

After the response has been sent, Post extensions are resolved.

# Layer 4 / Caching and compression

All outgoing data from this layer is cached based on the output of
[layer 5](#layer-5--pathing).

> The new Zstd compression is supported.

Rules can be created to get hits from other pages (the Prime extensions) when
accessing a page; server-side redirecting, above the caching level.

Compression can be `None` or `Full` to regulate automatic caching.

Caching has two options:

-   [Client cache](https://doc.kvarn.org/kvarn/comprash/enum.ClientCachePreference.html),
    `None` (`no-store`), `Changing` (2 minutes), `Full` (1 week), or
    `MaxAge(u32)` (same as `Full`, but with `max-age` set to the integer.)
-   [Server cache](https://doc.kvarn.org/kvarn/comprash/enum.ServerCachePreference.html),
    `None`, `QueryMatters` (requested path has to match query) or `Full` (query
    of path is ignored, to prevent DDOS attacks circumventing the _fast_ cache)

After the response is created by [layer 5](#layer-5--pathing), Present
extensions are run here.

Then, each time the response is sent, Package extensions are run.

# Layer 5 / Pathing

This is where the data of `::http::Request` is interpreted to either read a
file, run a Prepare extension, call PHP, or any _path_.

This whole layer can be customised, to for example implement a proxy. You have
complete control over the outgoing data (except for the first response; this is
a HTTP server!), cache method, and suggested compression.

## Layer 6 / Lib API

Only meant to be used from [layer 5](#layer-5--pathing).

This translates header values to more helpful structs, such as `accept*` and
`authentication` Can be found using Kvarns public API, through the module
`utils`.

It's also here the [`websocket`](https://doc.kvarn.org/kvarn/websocket/) module
operates. [Kvarn auth](https://crates.io/crates/kvarn-auth) utilizes this layer
too.
