!> hide

<head>
    <title>HTTP/3 with io_uring | Kvarn</title>
    <meta name="permalinks" content="enabled">
    <meta name="description" content="Web server with HTTP/3 using io_uring">
</head>

[HTTP/3](https://en.wikipedia.org/wiki/HTTP/3) is enabled by default.

Using a modern transport protocol, QUIC, enables HTTP/3 to be what HTTP/2 aimed
to be: fault-tolerant and massively parallel. Add way faster handshakes on top
on that, and HTTP/3 is groundbreaking. You can naturally
[disable](cargo-features.) the feature.

A custom implementation of QUIC using `io_uring` is embedded in Kvarn. This
gives you the power of the latest protocol with the fastest IO platform.
