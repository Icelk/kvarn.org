!> hide

<head>
    <title>Compilation features | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Features of Kvarn which can be choosen when compiling">
    $[highlight]
</head>

Certain features, such as HTTP/2, HTTPS, or compression might not be needed.
When Kvarn is deployed to an IOT device controlled from within the network, these features aren't needed.
Disabling them cuts down on compilation time, memory requirements, and space requirements.

> To view the dependencies used by each feature, see the [Cargo.toml file](https://github.com/Icelk/kvarn/blob/main/Cargo.toml).

These can be enabled in your `Cargo.toml`:

```ini
[dependencies]
kvarn = { version = "0.3", default-features = false, features = ["https", "http2", "all-encryption"] }
```

See the [official Cargo guide](https://doc.rust-lang.org/cargo/reference/features.html) on the matter.

---

Which Cargo features are required for certain items are also shown in the [docs](https://doc.kvarn.org/)
(e.g. the [`Host::new`](https://doc.kvarn.org/kvarn/host/struct.Host.html#method.new) function).

-   [`https`](/https.): Enables [HTTPS](https://en.wikipedia.org/wiki/HTTPS), the secure HTTP protocol.
    This is strongly recommended if you're doing anything that's not resource constrained and local.
-   [`http2`](/http2.): Enables [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2).
    This is strongly recommended as it's considerably faster and less resource intensive than HTTP/1.1, which is always supported.
    This also reduces latency due to implementation details.
-   `br`: [Brotli compression](https://en.wikipedia.org/wiki/Brotli)
-   `gzip`: [Gzip compression](https://en.wikipedia.org/wiki/Gzip#File_format)
-   [`graceful-shutdown`](/shutdown-handover.): Enables [graceful shutdown](https://doc.kvarn.org/kvarn/shutdown/) and handover.
    This means you can upgrade the Kvarn server without ANY downtime - using UNIX socket magic we bind the new server on the same sockets,
    then tell the old instance to shut down. All pending and current requests are waited for.
-   `auto-hostname`: Populates the [host name](https://doc.kvarn.org/kvarn/host/struct.Host.html#structfield.name) and [alternative names](https://doc.kvarn.org/kvarn/host/struct.Host.html#structfield.alternative_names)
    automatically. This uses the info stored in the certificate.
-   [`nonce`](/nonce.): enables usage of [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) on inline `<script>` and `<style>` elements.

There are additionally several _feature sets_:

-   `full`: enables all the features above.
-   `all-http`: enables all HTTP standards and versions available - `https` & `http2`
-   `all-compression`: enables all compression features - `br` & `gzip`
