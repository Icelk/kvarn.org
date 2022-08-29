!> hide

<head>
    <title>Security | Kvarn</title>
</head>

A web-server needs good security practises to
avoid
leaking data,
allowing unauthenticated API calls,
or go offline due to a DOS attacks.

Kvarn is built on top of these principles to provide security out of the box.

${toc}

# [CORS](/cors.)

Kvarn allows for easy configuration of CORS settings, reducing the risk of a vulnerable API,
in the case of a third party website suffering from XSS.

# Default CSP

To prevent XSS, Kvarn ships with a default [content security policy](../csp.).
The default is `default-src 'self'; style-src 'self' 'unsafe-inline'`, which allows content from the current website and inline styling.

You can of course [change the policy](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.html#method.with_csp), [programmatically](https://doc.kvarn.org/kvarn/csp/type.Csp.html),
with policies specific to locations on the site.

Kvarn also offers convenient [nonce](/nonce.).

# Rust

Kvarn is entirely written in Rust, a memory-safe language without a noticeable runtime penalty.
This removes the risk of buffer overflows, dangling pointers, and other undefined behaviour.

Not only the library, but also extensions (the code you write) are protected against this.

# Authentication

There exists an [authentication extension](https://crates.io/crates/kvarn-auth) which provides
a JWT implementation with support for persistent logins and validation servers.

It functions as the backbone for web authentication, and is already [deployed](https://icelk.dev/admin).

# Internal API

To reduce risks of faulty code, Kvarn abstracts several concepts of unsecure things.
This eliminates the risk of exposing data.

The response cache is stored in memory and never on disk.

## Strict request checks

When a request is parsed, certain components are analyzed to be legal.
This guarantees only files from the webroot are available (as long as your extensions don't read any other).

## File structure

The public files, certificates, error messages, and templates are in separate folders, independent from each other.

# [Limiting](/limiting.)

To prevent malicious actors from taking your site down, two layers of defense are implemented by default.
If a IP overrides a configured threshold of requests, it'll receive a error message until the timer is reset.

# Testing

Everybody makes mistakes.
A solid testing library and solid tests for a library can prevent pushing faulty code to prod.

Kvarn provides an easy-to-use testing library for integration testing your Kvarn extensions and your API.
It's also covered by tests validating logic, speed, and stability of Kvarn's code.

# Few lines of code

If we assume the act of programming is to introduce bugs, less code should mean less bugs.

The entirety of Kvarn, including the optional extensions, and it's reference implementation is less than 20K SLOC;
the whole codebase can be audited in a day.

# CSRF

To prevent [Cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery),
it's good to set the `Secure` and `SameOrigin` attributes on all cookies.
It's bad to use GET requests for any back-end operation which modifies the state.
POST requests are also more susceptible to CSRF attacks.

> If using Kvarn's [Prepare](/extensions/#prepare), you have to check for the method **manually**.
