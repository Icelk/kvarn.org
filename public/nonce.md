!> hide

<head>
    <title>Nonce | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Kvarn's integration with Content Security Policy nonce values.">
</head>

If you need inline scripts or styles, using
[nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)s
are a great idea. They guarantee only your scripts are ran on your website.

> See [CSP](/csp.) for more general information regarding the security of your
> website, especially regarding XSS attacks.

Kvarn, by
[default](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.#method.new),
adds a [Present](https://doc.kvarn.org/kvarn/extensions/type.Present.) extension
which enables the `nonce` [internal present](/extensions/#internal) extension.
Add that to the top of your file and just insert a nonce attribute to your
inline style or script element: `<script|style nonce="">...</script|style>`. The
content (if any) between the quotes (both `"` and `'` are supported) is replaced
by the random nonce value, which is also included in the
`content-security-policy` header. This random value is a 128-bit random number
generated from a cryptographically secure source, encoded in Base64. It will
therefore always have the length 24 bytes. This is what's recommended by MDN.

> Between the nonce being generated in the Present extension and consumed in the
> Package extension (which is what adds the CSP header), the nonce value is
> stored in the response header `csp-nonce`, which is removed by the Package
> extension.
