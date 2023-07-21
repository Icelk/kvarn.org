!> hide

<head>
    <title>HTTP/2 support | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Usage of HTTP/2 in the Kvarn web server.">
</head>

[HTTP/2](https://en.wikipedia.org/wiki/HTTP/2) is enabled by default. It's a
superior protocol to HTTP/1.1. In the few scenarios HTTP where is favourable
(IOT devices, internal servers, local testing), you can
[disable](cargo-features.) the feature. Kvarn passes all tests of the spec.

> To test the conformance to the spec, run `h2spec -th icelk.dev` using
> [h2spec](https://github.com/summerwind/h2spec). You should see
> `146 tests, 146 passed, 0 skipped, 0 failed` as the last line of output.

This speeds up serving, reduces data usage (HTTP headers are compressed), and
enables HTTP/2 push, which Kvarn [implements without any config](push.).

HTTP/2 is implemented at
[layer 3](http://localhost:8080/pipeline.#layer-3--http) of the Kvarn stack.
