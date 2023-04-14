!> hide

<head>
    <title>Content security policy | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Details on content security policy (CSP) in Kvarn.">
</head>

CSP tells the browser where it's OK to load resources from.

This can help prevent certain attacks, such as [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting). CSP disables the ability to load malicious scripts and styles.

Like [CORS](cors.), CSP is handled through a ruleset. This allows parts of a site to use different policies.

Note that previous versions of Kvarn (before v0.4.0), the `new` method meant `empty`.
You should probably always use `default`.
See the example below.

In situations where you want a clean slate, use the `empty` method. Then, I'd recommend setting a catch-all method (using path `*`).

# Reverse proxy CSP getting overridden

This is intended behaviour to reduce risks of XSS.

You can disable CSP by adding a empty ruleset:

```rust
extensions.with_csp(Csp::empty().arc());
```

# Examples

```rust
let mut extensions = Extensions::new();
extensions.with_csp(
    Csp::default()
        .add(
            "*",
            CspRule::default().img_src(CspValueSet::default().uri("https://kvarn.org")),
        )
        .arc(),
);
```
