!> hide

<head>
    <title>Testing | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Method of testing Kvarn applications and the Kvarn library">
    [highlight]
</head>

Testing is integral to smooth deployment. Kvarn is covered by many unit and integration tests.
Using [GitHub Actions](https://github.com/Icelk/kvarn/actions), the whole codebase is linted and tested for every change.

It is available at [crates.io](https://crates.io/crates/kvarn_testing/).

# Application testing

If you're an author of an application powered by Kvarn and want to test it, you've come to the right place.

Below is an example of a production test. Unit tests are naturally also supported, and look exactly the same.

`Cargo.toml`:

```ini
# add the following to the bottom (or add to you dev-dependencies if you already have that section)
\[dev-dependencies]
tokio = { version = "1", features = ["net", "io-util", "macros"] }
# use the same version as the main Kvarn library
kvarn_testing = "0.3"
```

`tests/byte_ranges.rs`:

```rust
#\[tokio::test]
async fn out_of_bounds() {
    // Add an extension to the server
    let server = ServerBuilder::default().with_extensions(|ext| {
        ext.add_prepare_single(
            "/index.html",
            prepare!(_request, _host, _path, _addr {
                let bytes = Bytes::from_static(DATA.as_bytes());
                FatResponse::cache(Response::new(bytes))
            }),
        );
    });
    // start the server (automatically chooses an available port)
    let server = server.run().await;

    // send GET request
    let response = server
        .get("/")
        .header("range", "bytes=50-100")
        .send()
        .await
        .unwrap();

    assert_eq!(
        response.status(),
        reqwest::StatusCode::RANGE_NOT_SATISFIABLE
    );
    assert_eq!(
        response.headers().get("reason").unwrap().to_str().unwrap(),
        "Range start after end of body"
    )
}
```

The documentation for the testing library can be found at [doc.kvarn.org](https://doc.kvarn.org/kvarn_testing/).
