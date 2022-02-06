!> hide

<head>
    <title>HTTP/2 push | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Details on HTTP/2 push as featured in Kvarn.">
</head>

One of the features of [HTTP/2](http2.) is the ability to push content to user agents before they request them.

${toc}

# Example

Say someone visits [icelk.dev](https://icelk.dev/). When Kvarn gets the request to `/`, it knows the user agent (web browser) will request `/icelk-logo.png`, `/script.js`, `/style.css`.
Right after sending the response, Kvarn looks for links on the responded web page. If it finds any, it pushes them to the user agent. It generates requests and responses which are sent using the HTTP/2 protocol.

It would be wasteful to push resources on every page load, so the [default](https://doc.kvarn.org/kvarn_extensions/push/fn.mount.html) implementation has a limit of pushing only every two minutes.
You can however force Kvarn to [always push](https://doc.kvarn.org/kvarn_extensions/push/fn.always.html) content.

# Issues with Firefox

Pushing content to Firefox-based user agents doesn't work through Kvarn.
The reason is unknown.
Kvarn checks for the `user-agent` header and ignores Firefox browsers when pushing content.

This is odd, considering other push implementations work just fine, but Kvarn passes more checks in the [`h2spec`](https://github.com/summerwind/h2spec) testing tool.
In fact, Kvarn passes **all** tests.
It also works flawlessly with all Chromium-based browsers, Safari browsers, and the `nghttp2` tool. Running `nghttp https://localhost:8443 -nv` gives all the push promises correctly.

# Specifying resources to be pushed

Internally, the [`url_crawl`](https://doc.kvarn.org/url_crawl/index.html) crate is used for getting URLs.

You can specify several `push` HTML elements (they are not in any spec and therefore don't have any semantic meaning) in the `<head>` of the document, with the format as follows:

```html
<!-- snip -->
    <push src="my-dataset.csv" />
<!-- snip -->
```
