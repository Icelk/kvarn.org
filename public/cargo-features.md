!> hide

<head>
    <title>Compilation features | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Features of Kvarn which can be choosen when compiling">
</head>

Certain features, such as HTTP/2, HTTPS, or compression might not be needed.
When Kvarn is deployed to an IOT device controlled from within the network,
these features aren't needed. Disabling them cuts down on compilation time,
memory requirements, and space requirements.

> To view the dependencies used by each feature, see the
> [Cargo.toml file](https://github.com/Icelk/kvarn/blob/main/Cargo.toml).

These can be enabled in your `Cargo.toml`:

```toml
[dependencies]
kvarn = { version = "0.5", default-features = false, features = ["base", "https", "http2", "all-compression"] }
```

See the
[official Cargo guide](https://doc.rust-lang.org/cargo/reference/features.html)
on the matter.

---

Which Cargo features are required for certain items are also shown in the
[docs](https://doc.kvarn.org/) (e.g. the
[`Host::new`](https://doc.kvarn.org/kvarn/host/struct.Host.html#method.new)
function).

Please always enable `base` (see below for more details).

-   [`uring`](/uring.): Use the
    [io-uring](https://en.wikipedia.org/wiki/Io_uring) API for network and file
    system IO on Linux. ~0-15% better performance, depending on use-case. Do
    your own benchmarks!
-   [`http3`](/http3.): Enables [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3).
    Strongly recommended, since HTTP/3 is faster than both HTTP/1 & HTTP/2, due
    to the new protocol, QUIC. Enabling HTTP/2 in tandem is also recommended,
    since the initial connection is done over TCP, so having the fastest TCP
    protocol (HTTP/2) available is beneficial. Works both with and without
    `uring` (world first!).
-   [`https`](/https.): Enables [HTTPS](https://en.wikipedia.org/wiki/HTTPS),
    the secure HTTP protocol. This is strongly recommended if you're doing
    anything that's not resource constrained and local.
-   [`http2`](/http2.): Enables [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2).
    This is strongly recommended as it's considerably faster and less resource
    intensive than HTTP/1.1, which is always supported. This also reduces
    latency due to implementation details.
-   `br`: [Brotli compression](https://en.wikipedia.org/wiki/Brotli)
-   `gzip`: [Gzip compression](https://en.wikipedia.org/wiki/Gzip#File_format)
-   [`graceful-shutdown`](/shutdown-handover.): Enables
    [graceful shutdown](https://doc.kvarn.org/kvarn/shutdown/) and handover.
    This means you can upgrade the Kvarn server without ANY downtime - using
    UNIX socket magic we bind the new server on the same sockets, then tell the
    old instance to shut down. All pending and current requests are waited for.
-   `auto-hostname`: Populates the
    [host name](https://doc.kvarn.org/kvarn/host/struct.Host.html#structfield.name)
    and
    [alternative names](https://doc.kvarn.org/kvarn/host/struct.Host.html#structfield.alternative_names)
    automatically. This uses the info stored in the certificate.
-   [`nonce`](/nonce.): enables usage of
    [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)
    on inline `<script>` and `<style>` elements.
-   [`websocket`](https://doc.kvarn.org/kvarn/websocket/): enables the
    `websocket` module in Kvarn which allows easy and fast WebSockets from you
    web application.
-   `async-networking`: use Tokio's async networking primitives instead of the
    blocking `std::net` variants. Recommended for every application that can
    enable it. See [embedded](#embedded) for more details.

There are additionally several _feature sets_:

-   `full`: enables all the features above.
-   `base`: enables `async-networking`, a feature considered critical for all
    platforms except embedded (e.g. ESP32-IDF)
-   `all-http`: enables all HTTP standards and versions available - `https` &
    `http2` & `http3`
-   `all-compression`: enables all compression features - `br` & `gzip`

# Embedded

Some embedded platforms have `std` support (e.g. ESP32-IDF) but don't support
`mio`. Disabling the feature `async-networking` causes Kvarn to block on every
request, but removes the dependency on `mio`. It's very useful for IOT devices
which don't need large throughput nor sub-ms responsiveness (which the embedded
controllers doesn't have computing power to achieve anyway).
