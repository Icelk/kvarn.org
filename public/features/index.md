!> hide

<head>
    <title>Features of Kvarn</title>
</head>

# Features & why to use Kvarn

Kvarn tries to package many useful features without being bloated.
Optional extensions are available in [the extensions crate](https://github.com/Icelk/kvarn/tree/main/kvarn_extensions).

Here is a incomplete list of Kvarn's features, most of which have guides in their respective pages.

> Some require certain [Cargo "features"](/cargo-features.) to be compiled in,
> and some require `kvarn_extensions`.
> This will be explicitly noted.

${toc}

# Sane defaults

[The example](/#getting-started) of running a Kvarn server provides sane defaults, which optimize security; speed; and help mitigate DOS attacks.

# [HTTP/2](/http2.)

> Requires the feature `http2` (part of `default` and `full`)

HTTP/2 is abstracted from all other internal and extension logic; offering complete parity.
This means you get all the pros of the latest protocols without any code.

Kvarn passes the [h2spec test](https://github.com/summerwind/h2spec).
If something doesn't work, it's the user agent not conforming.

## [HTTP/2 Push](/push.)

> Part of `kvarn_extensions` under the feature `push` (part of `default`)

HTTP/2 introduced a features where the server can push other resources before the client requests them.
This has not been widely used because of the problem with pushing to the client when it's already got
the resource in a cache.

Kvarn aims to solve this by making it simple to integrate, _not requiring any configuration_
and not sending the same resource twice to a client.

# [HTTPS](/https.)

> Requires the feature `https` (part of `default` and `full`)

HTTPS makes the web more secure. Kvarn's design is not only influenced by HTTPS, but
encourages you to use it.

When creating a virtual host, the recommended constructor redirects all HTTP requests to
HTTPS before the request reaches your code.

Kvarn also suggest using HSTS. When you're ready, you only need to add one line of code to enable it for a host,
improving security further.

If you want maximum security, you can of course simply not listen on port `80`, reducing the code you write.

# Full documentation coverage

Documentation and examples are key to a good library.

You can always read [Kvarn's documentation online](https://doc.kvarn.org).
Under `Crates` to the left, you can explore all other crates part of [the ecosystem](/ecosystem/).

The full coverage is enforced by the compiler. All examples are enforced to run correctly by Rust's builtin testing.

# [Extensions](/extensions/)

Kvarn in it's default acts as a file-server. That in itself isn't useful for building a backend.
To build a API, implement authentication, add dynamic language support, or [CORS](https://en.wikipedia.org/wiki/CORS),
_extensions_ provides the data and tools you need.

As there are few and small performance benefits of implementing features directly into Kvarn, but great flexibility advantages.
Therefore, as many features as possible are built as extensions.

When writing an API, Kvarn handles all HTTP boilerplate. It'll cache, compress, encrypt, set `content-length`, and [secure](/security/)
the response, with minimal info from the implementation.

There exists several types of extensions, all of which have a separate function for complete control over the response pipeline.
A _present_ extension can be called from within a file.
If it start with `!>` you can specify present extensions like this `!> my-extension arg1 arg2 &> another-extension argument...`.
These are evaluated in order, first to last.

Here, server-side caching is critical for heavy workloads.
The flexibility of Kvarn is advantageous; if you have frequent changes, content is recalculated on the fly, but if you need performance,
it'll cache the results as a complete response, ready to be sent.
Kvarn tries to generalize requests, reducing cache misses.
This also acts as a primitive anti-DOS strategy; if no new content is calculated (or read from disk),
the requests are _very_ cheap.

# [Cache](/cache.)

When Kvarn was created, a reverse-proxy caching the responses from a web application seemed slow.
It holds up to this day.

The built in cache in Kvarn is in-memory for performance and integration with extensions is seamless.

If you build extensions directly in Kvarn with it's convenient [macros](https://doc.kvarn.org/kvarn/index.html#macros)
with C-like performance. It's much faster, and easier to manage, than a reverse-proxy fighting with Node's
`transfer-encoding: chunked` and not being sure of exactly how to cache the content.

If you need the maintenance advantage of a modular system, look no further than [Kvarn's handover](#graceful-shutdown--handover).

# [PHP](/php.)

> Part of `kvarn_extensions` under the feature `php` (part of `default`)

Kvarn can interpret `.php` files and send them back, with all of Kvarn's other features.
Server caching can be set with the [`kvarn-cache-control`](/cache.#kvarn-cache-control) header.

# [MarkDown](/chute/)

> Part of [Chute](/chute/)

Sometimes you need to write a consistent website easily, with minimal effort.
That's where _Kvarn Chute_ comes in. You write MarkDown, Chute translates it to HTML, using
[Kvarn's templating system](/templates.).

Long pages are hard to navigate. Therefore, Chute offers a **table of contents** generator.
Just insert `\${toc}` in your document, run `chute -y <doc>`. You now have a high-quality HTML-only TOC.

This page is written using this features, reducing boilerplate _even more_ and speeding up documentation.

You can add tags to the head of the HTML by starting the MD document (after the extensions declaration) with a `<head>` tag.
You'll of course have to close it when all the metadata is written.

As with normal files, you can run extensions.
Chute will automatically add the `tmpl` (template) extension with the `standard.html` and `md.html`
templates present. If you add `!> hide` to hide the MD source, it'll be removed, so users can view the HTML.

# [Templates](/templates.)

> Part of `kvarn_extensions` under the feature `templates` (part of `default`)

To build a consistent website, you need templates. Copying your header and footer isn't viable!
As a simple, fast, and easy to use template system,
this can virtually copy-paste bytes from a template file
(located in `<webroot>/templates/`), but does not, for example,
handle conditional inclusion or loops. Only simple inclusion.

The nav-bar on this page is powered by the templates.
HTML documents are about 15 lines for a title, heading, and a paragraph,
and of course the nav-bar.

See [this directory in the source code of this website](https://github.com/Icelk/kvarn.org/tree/main/templates/) for an example of the format of templates.

# [Full text search engine](/search.)

A search engine with typo tolerance, no index set-up, and fast (1-4ms) responses.

Boasts an API for accessing the search hits.
This means you can implement your own frontend,
or use mine at [icelk.dev](https://icelk.dev). All the code for that is summarized at [the example](/search.#frontend).

See the link for more information.

# [CORS](/cors.)

As the web has expanded and complexity increased, cross-site requests have become essential.

> Many of the best-practises of HTTP/1.1; loading from multiple domains and chunking together content
> is irrelevant when using HTTP/2, as it resolves these issues.

Kvarn features a CORS handling (using extensions), backed by testing, which blocks unauthorized CORS requests
before they get to your API. This ensures all CORS requests, even from faulty user agents, don't change server state.

# [Graceful shutdown & handover](/shutdown-handover.)

> Requires the feature `graceful-shutdown` (part of `default` and `full`)

To enable upgrade of the server, you need to shut it down and then start it up, with *no* downtime.
The way Kvarn solves this is through graceful shutdown and handover.

# [Reverse proxy](/reverse-proxy.)

> Part of `kvarn_extensions` under the feature `reverse-proxy` (part of `default`)

If you want to develop your web application in another language, Kvarn can act as a reverse proxy, with all the benefits of
HTTP/2, caching, and easy upgrades.

In contrast to writing extensions in Rust, the speed and throughput is greatly reduced.

# Guaranteed memory-safety

Kvarn is written in [Rust](https://rust-lang.org).

This greatly improves security (resilience against buffer overflows) and reliability,
as Rust guarantees pointers to be valid through it's strict borrowing rules.
This, together with phenomenal error handling and strong tooling makes for maintainable and predictable code.

The borrow rules ensure memory safety without runtime overhead, while being as fast as C
(assuming the code is optimal, which is easier to accomplish with Rust).

The compiler catches _nearly all_ errors. The quote, "if it compiles, it runs" is indeed true.
Compare Rust vs C++ to TS vs JS, only in one case silly bugs cause production to go offline.

# Other fundamental features & systems

-   Completely [asynchronous](/async.), powered by [Tokio](https://tokio.rs), the runtime used by [Deno](https://deno.land).
-   [Limiting](/limiting.) of requests to provide availability to all users. This is a _primitive_ defence against small DOS attacks.
-   [Error handling](/errors.#overriding-http-errors) for customizing HTTP errors, with support for all extensions, including templates.
    If you visit [a page which doesn't exist on kvarn.org](/intentional-404), you'll see the same nav-bar as everywhere else. That took 10 lines of HTML to set up.
-   [Optional features](/cargo-features.) offer the best of both worlds; HTTP/2, HTTPS, and graceful shutdown
    results in a larger binary and slower compile-times,
    but disabling those features makes Kvarn [viable to compile on a Raspberry Pi](https://github.com/Icelk/httPWM/#state-of-project).
-   [Virtual hosts](/host.) allow multiple domains and sub-domains to be hosted on the same system.
    All configuration is defined per host.
-   IPv6 support.
-   [Utilities](/utils.) for extracting data from HTTP requests. This will include a basic authentication system soon.
-   [Testing](/testing.) with a public frontend to test your APIs before production.
    To run a Kvarn server and send a request takes 2 lines of code.

# Back to the basics

> Doesn't mean they're more simple or easier to implement, as development time has shown. ಠ\_ಠ

-   Compression automatically applied to the response. This handles negotiating the algorithm. Brotli and Gzip support.
-   [CSP](../csp.) support.
-   Extremely simple to use [nonce](../nonce.) support.
-   If-Modified-Since for more effective caching. This is directly integrated with `lifetime`s in the Kvarn cache.
-   [URL handling](/extensions/redirects.) of requests ending in `/` (becomes `/index.html` by default) and `.` (becomes `.html` by default).
-   Logging using Rust's standard logger, enabling you to chose a log implementation which works for you.
-   Idiomatic Rust, guaranteed by [Clippy](https://github.com/rust-lang/rust-clippy).
