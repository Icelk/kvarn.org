!> hide

<head>
    <title>Redirects | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="How redirects work in Kvarn. Both index redirects and HTTP to HTTPS.">
</head>

# URI redirect

When you visit `kvarn.org`, the web server doesn't fetch the directory that is
the root of the files. It naturally searches for `public/index.html`. That's
what most web servers do when a query points to a directory.

Kvarn takes this a step further (by default, you can of course disable this
behaviour, but why would you?). For one, it checks the path of the request URI
for a final `/`. Only then does it search for an `index.html`. This is due to
performance - we wouldn't want to check the FS if the request is a directory or
a file. That takes time.

Additionally, it looks up `.html` if the path ends in `.`. `kvarn.org/pipeline.`
= `kvarn.org/pipeline.html`. If an empty filename doesn't make sense, why should
a empty file extension?

> This may cause trouble with social media. Just insert a `html` at the end.

The `.html` and `index.html` aren't hard-coded, but can be
[changed](https://doc.kvarn.org/kvarn/host/struct.Options.html#structfield.folder_default).

This is handled using a
[prime](https://doc.kvarn.org/kvarn/extensions/type.Prime.html) extension, which
internally redirects the request if it ends with `.` or `/`.

The method which handles this is
[`with_uri_redirect`](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.html#method.with_uri_redirect).

# HTTP to HTTPS

By default, Kvarn tries to upgrade HTTP requests to HTTPS ones, by replying with
a `307 Temporary Redirect` with a location of the same page, but with HTTPS.

This is also a prime extension, that redirects the request to a special prepare
extension which is only accessible to the internals. There, it responds with the
`307 Temporary Redirect`.

The [extension above](#uri-redirect) has a higher priority and is therefore ran
before. Notice the **/index.html** below.

```shell
$ curl -i http://icelk.dev
HTTP/1.1 307 Temporary Redirect
location: https://icelk.dev/index.html
server: Kvarn/0.5.0 (Linux)
connection: keep-alive

...
```

That is a by-product of the URI redirection.
