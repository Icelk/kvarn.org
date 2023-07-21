!> hide

<head>
    <title>Limiting | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Request limiting for Kvarn">
</head>

To prevent clients from issuing too many requests, Kvarn is bundled with a
request limiter. The limits can be set by the user. When they are reached, a
[`429`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) response
is sent. If the client persists, the current and future connections are dropped
once more than 3x the allowed limit is reached.

See the [Kvarn documentation](https://doc.kvarn.org/kvarn/limiting/) for more
details on usage.
