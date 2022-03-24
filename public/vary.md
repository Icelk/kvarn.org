!> hide

<head>
    <title>Vary cache | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Kvarn's implementation of the Vary HTTP header and cache method">
</head>

Using the Vary header, the web server can cache several variants of the same page (different languages, compression algorithms, etc.).
Kvarn's built-in [cache](/cache.) [supports this through configuration](https://doc.kvarn.org/kvarn/vary/), similar to how [CORS](/cors.) is configured.

See [the docs](https://doc.kvarn.org/kvarn/vary/type.Vary.) for an example.

# Implementation

When an entry (page) is found in the cache, the contents are checked for matches according to the [vary rule](https://doc.kvarn.org/kvarn/vary/struct.Settings.html).
If no match is found, a new response is created and stored.

So for each page cache, there might exist several **_Vary_**ations of the page. These are served according to a user-defined function, which often reads the `accept*` headers.
