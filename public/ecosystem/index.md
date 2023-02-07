!> hide

<head>
    <title>Ecosystem | Kvarn</title>
    <meta name="permalinks" content="enabled">
    <meta name="description" content="The Kvarn ecosystem. A guide to all it's components and features.">
</head>

# The Kvarn Ecosystem

To make Kvarn competitive with the major players, several pre-built extensions are encouraged to be used.

[Mölla](/moella/) provides an easy and powerful way to use Kvarn.

Kvarn has a [extensive extension API](/extensions/) which allows you, the user of Kvarn, to do whatever you
want with Kvarn, with performance like it was built in.

## Extensions

Kvarn strives to be as modular as possible.

There exists five points you can attach to modify request, responses, and other metadata, both before and after the request is sent (e.g. to log, HTTP/2 push).
Common patterns are documented at [the extensions page](../extensions/#details).
Details on the functionality of extensions are also [available](http://localhost:8080/extensions/#the-five-ps).

---

More extensions are available using the [`kvarn_extensions`](https://doc.kvarn.org/kvarn_extensions/).
There, you get PHP support, a reverse proxy, templates, HTTP/2 push, and several present extensions.
Everything is naturally [optional](../cargo-features.).

### Search

A [site search engine integration](../search.) with Kvarn is also available.

### Auth

A fast, simple, and customizable [authentication extension](https://crates.io/crates/kvarn-auth)
which makes it impossible to shot yourself in your foot!

Kvarn auth provides an easy-to-use JWT-based authentication helper with support for persistent logins and validation servers.

You provide an async callback which gives the user a level of authorization. You can return any structured data based on serde. The JWT is automatically renewed, as the server stores a credentials cookie (encrypted using the server’s private key). Everything is configurable.

## Docs

[Online documentation](https://doc.kvarn.org) is available for the git branch.
Refer to [docs.rs](https://docs.rs/kvarn) for docs for stable releases.

## Management

Management of the Kvarn server is done through IPC, using UNIX sockets.
[`kvarnctl`](../ctl/) is a feature-complete command dispatcher.

## Markdown

Using [Kvarn chute](/chute/) you can convert CommonMark documents to HTML pages, making use of [Kvarn's templates](/features/#templates).
In fact, I'm writing this document in CommonMark and having chute export it every time I save.

This enables fast prototyping and writing with quality results, fitting in with the rest of the website.

It's smart, so if you declare any [present extensions](../extensions/#present), they are transferred. The `hide` extension is removed, so MD documents can be hidden (this is).

It also supports adding to the HTML header by simply declaring a `<head>` element the first thing in the document.

## Reference implementation

In addition to the tools above, a reference implementation (the one which is currently serving you content)
is [available on GitHub](https://github.com/Icelk/moella/). It uses an intuitive [config format](/moella/).

Due to the modularity of Kvarn, and it merely being a library for listening to ports, a binary implementation is needed. If this is the reference implementation or your program embedding Kvarn, doesn't matter.
