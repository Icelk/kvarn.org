!> hide

<head>
    <title>Async | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Asynchronous layout in Kvarn.">
</head>

Kvarn uses [Tokio](https://tokio.rs) as the asynchronous runtime. It's the same
used in [deno](https://deno.land). Every [extension](/extensions/) is
asynchronous. This enables parallel execution to requests.

If you need to send a request to your database or read a file, use async APIs.
See the [Tokio docs](https://docs.rs/tokio/) for more info.

This uses Rust's built-in
[async-await syntax](https://rust-lang.github.io/async-book/01_getting_started/04_async_await_primer.html).
If you need any library for IO (networking, file system, database connections),
there probably exist an async version at [crates.io](https://crates.io).

You can of course also use synchronous APIs, but that blocks other requests, and
is therefore strongly discouraged. Consider using
[`spawn_blocking`](https://docs.rs/tokio/latest/tokio/task/fn.spawn_blocking.html)
instead.

# Crate

To support these efforts, a
[`kvarn_async`](https://crates.io/crates/kvarn_async/) is available. It also
allows you to read from an async source to [`Bytes`](https://docs.rs/bytes/),
without an intermediate `Vec`.

You can view it's documentation [online](https://doc.kvarn.org/kvarn_async/).
