!> hide

<head>
    <title>Extensions | Kvarn</title>
    $[highlight]
</head>

To extend the core functionality of Kvarn, you'll use _extensions_.
They are ran in an async context, so you can call async APIs to fetch data.
They provide options for attaching to all parts of the request pipeline,
with virtually no overhead compared to editing Kvarn's source.

${toc}

# Details

The following pages are details on implementation useful to read if you're working with Kvarn, even just as the web server to host your files.

-   [Redirects](redirects.)
-   APIs under the path `/./` are not accessible from the outside, as Kvarn's security guarantees forbid this.\
    A common pattern is to make [Prime](https://doc.kvarn.org/kvarn/extensions/type.Prime.html)
    extensions which redirect to [Prepare](https://doc.kvarn.org/kvarn/extensions/type.Prepare.html) APIs located here.
    Then, you can conditionally change the path of a request to internal APIs (e.g. authentication, special admin panels).

# Building an API

In Kvarn, you can attach to single URLs
or provide a function which takes the request and
determines whether or not your code should override the deafult.

> In the immediate future, you should be able to say "I want to capture `/api/{string}/{0..=100}`"

You then get request, a reference to the target host, an optional path, and the IP and port the request came from.
You provide a response, which can be asynchronous,
and Kvarn will handle all comression, `content-length`,
delivery, HTTP protocols, caching (according to your preference, returned as part of the reponse),
other extension, and encryption.

This is in contrast to Node.js where you have to handle all cases,
resulting in large `if else` statements
(if you don't use a library, in which case Kvarn is a lot faster and just as convenient).

# The five *P*s

Kvarn is very extensible. Therefore, several pluggable interfaces (called extensions) exist to make integration fast and seamless.

Here are the five *P*s chronologically ordered from the request's perspective.

## [Prime](https://doc.kvarn.org/kvarn/macro.prime.html)

-   [ ] Not cached

This is where you can add cache redirects.
If you for example want to load the login page on all privileged pages (when the user is not logged in),
you can check for the `authentication` HTTP header
and from there decide to intercept the request.

It is also here where all HTTP requests are upgraded to HTTPS, by redirecting the request to
a special page where a 307 redirect is responded with.

## [Prepare](https://doc.kvarn.org/kvarn/macro.prepare.html)

-   [x] Optional. If the response contains a future (WebSockets), it'll never cache.

You provide either a URI or a function of when to activate your code.
Will still get all other extensions applied.

> The `path` variable you get here will be `None` if the `fs` feature of a `Host` isn't enabled or percent decoding failed.
> Be sure to handle percent encoding when taking the `request.uri().path()`. Using the `path` handles this for you.

**You have to handle all HTTP methods**, as Kvarn passes all, except for `HEAD`, which it handles by simply omitting the body.
**If your `response-type` is something other than HTML, you must set the header.**

It's very useful for APIs (both REST and GraphQL!)

Here, you could, for example, implement reading from the file system, like Kvarn does by default.

### [Single](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.#method.add_prepare_single)

These bind to a single page.

### [fn](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.#method.add_prepare_fn)

You provide a predicate which returns whether or not to run this extension.

## [Present](https://doc.kvarn.org/kvarn/macro.present.html)

-   [x] Cached

Here, files can opt in to extensions to manipulate data, such as the template system and `hide` extension.

This type can modify most data in response and will be executed in series.

Extensions can also attach to filetypes.

### [Internal](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.#method.add_present_internal)

These are declared on the first line in a file, acording to the following syntax:

```md
!> extension arg1 arg2 &> second-extension-name with these four arguments &> and-so-on

My blog...
```

There can be arbitrarily many extensions. The are separated by [`&>`](https://doc.kvarn.org/kvarn_utils/extensions/constant.PRESENT_INTERNAL_AND.html).

The first word (space-separated) is the extension name. The others are arguments. Extensions might not look for arguments, or error if any invalid input is given,
just like applications.

You can naturally also give just one extension:

```md
!> nonce

My vlog...
```

When Kvarn serves the file, this line is removed.

Extensions are processed left to right.

[File](#file) extensions are processed after the internal ones. Keep in mind that some file extensions might read from the file system.
Changes to the response isn't written, so the changes will be lost.

### [File](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.#method.add_present_file)

These are set on a per filename basis.

`.php` files can be bound to be processed by `fastcgi`, as the [`kvarn-extensions` extension](https://doc.kvarn.org/kvarn_extensions/php/index.) does.

## [Package](https://doc.kvarn.org/kvarn/macro.package.html)

-   [ ] Not cached

Here, you can define headers to add to the final response.
These headers are not cached, but applied every time. You can therefore compare things like other headers and the version of the request.

Cookies can be defined here, since they won't be cached.

## [Post](https://doc.kvarn.org/kvarn/macro.post.html)

-   [ ] Not cached

These extensions are called after all data are written to the user. This will almost exclusively be used for HTTP/2 push.

Maybe, it can be used to sync data to a database after the request is written to not block it?

# Writing an extension

Using [the macros](https://doc.kvarn.org/kvarn/index.html#macros) is recommended.

You can however writing them manually.
The adding methods of [`Extensions`](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.html)
expect a boxed struct which implements the [appropriate `*Call` trait](https://doc.kvarn.org/kvarn/extensions/index.html#traits).

```rust
use kvarn::prelude::*;

struct Ext {
    name: &'static str,
    counter: threading::atomic::AtomicUsize,
}
impl extensions::PrepareCall for Ext {
    fn call<'a>(
        &'a self,
        request: &'a mut FatRequest,
        host: &'a Host,
        path: Option<&'a Path>,
        addr: SocketAddr,
    ) -> extensions::RetFut<'a, FatResponse> {
        extensions::ready(FatResponse::no_cache(Response::new(
            Bytes::try_from(format!(
                "# {}\n You are nr. {}.",
                self.name,
                self.counter.fetch_add(1, threading::Ordering::SeqCst)
            ))
            .unwrap(),
        )))
    }
}

let mut extensions = Extensions::new();
let ext = Ext {
    name: "My website",
    counter: threading::atomic::AtomicUsize::new(1),
};
extensions.add_prepare_single("/index.html", Box::new(ext));
```

# Example

Let's build one of each extension to see how they fit together.

This example requires basic knowledge about Rust to be understood, but the general workflow should be clear.

Note how we create extensions by calling [their respective macros](https://doc.kvarn.org/kvarn/#macros).
This does a lot under the hood.

If any variables or names confuse you, copy the code and inspect it with your IDE (i.e. `rust-analyzer`).
The macros are designed to cooperate with Rust tools to give the best possible feedback.

`Cargo.toml`:

```ini
[package]
name = "unicorn-backend"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
kvarn = "0.5"
tokio = { version = "1.24", features = ["rt-multi-thread", "macros"] }
env_logger = "0.10"
```

`src/main.rs`:

```rust
use kvarn::prelude::*;

#[tokio::main]
async fn main() {
    env_logger::init();

    let mut extensions = Extensions::empty();

    extensions.with_cors(
        Cors::empty()
            .add(
                "/api*",
                CorsAllowList::default().add_origin("https://icelk.dev"),
            )
            .arc(),
    );

    extensions.add_prime(
        prime!(request, _host, _addr, {
            if request.uri().path() == "/" {
                // This maps the Option<HeaderValue> to Option<Result<&str, _>> which the
                // `.and_then(Result::ok)` makes Option<&str>, returning `Some` if the value is both `Ok` and `Some`.
                // Could also be written as
                // `.get("user-agent").and_then(|header| header.to_str().ok())`.
                if let Some(ua) = request
                    .headers()
                    .get("user-agent")
                    .map(HeaderValue::to_str)
                    .and_then(Result::ok)
                {
                    if ua.contains("curl") {
                        Some(Uri::from_static("/ip"))
                    } else {
                        Some(Uri::from_static("/index.html"))
                    }
                } else {
                    None
                }
            } else {
                None
            }
        }),
        Id::new(16, "Redirect `/`"),
    );

    extensions.add_prepare_single(
        "/ip",
        prepare!(_request, _host, _path, addr, {
            let ip = addr.ip().to_string();
            let response = Response::new(Bytes::copy_from_slice(ip.as_bytes()));
            FatResponse::no_cache(response)
        }),
    );
    extensions.add_prepare_single(
        "/index.html",
        prepare!(_, _host, _, addr, {
            // This uses the present extension `simple-head` declared just below this extension.
            let content = format!(
                "!> simple-head Your IP address\n\
                <h2>Your IP address is {}</h2>",
                addr.ip()
            );
            let response = Response::new(Bytes::copy_from_slice(content.as_bytes()));
            FatResponse::new(response, comprash::ServerCachePreference::None)
        }),
    );

    extensions.add_present_internal(
        "simple-head",
        present!(present_data, {
            let content = present_data.response().body();

            let start = r#"
<!DOCTYPE html>
<html>
<head>
    <title>"#;
            let middle = r#"</title>
</head>
<body>"#;
            let end = r#"
</body>
</html>
"#;
            let title = present_data
                .args()
                .iter()
                .fold(String::new(), |mut acc, arg| {
                    acc.push_str(arg);
                    acc.push(' ');
                    acc
                });

            let bytes = build_bytes!(
                start.as_bytes(),
                title.as_bytes(),
                middle.as_bytes(),
                content,
                end.as_bytes()
            );
            *present_data.response_mut().body_mut() = bytes;
        }),
    );
    extensions.add_package(
        package!(response, _request, _, {
            response
                .headers_mut()
                .insert("fun-header", HeaderValue::from_static("why not?"));
            response.headers_mut().insert(
                "content-security-policy",
                HeaderValue::from_static("default-src 'self'; style-src 'unsafe-inline' 'self'"),
            );
        }),
        Id::new(-1024, "add headers"),
    );
    extensions.add_post(
        post!(_request, host, _response_pipe, identity_body, addr, {
            if let Ok(mut body) = str::from_utf8(&identity_body) {
                body = body.get(0..512).unwrap_or(body);
                println!("Sent {:?} to {} from {}", body, addr, host.name);
            }
        }),
        Id::new(0, "Print sent data"),
    );

    // Let's see which extensions are attached:
    println!("Our extensions: {:#?}", extensions);

    println!("Notice all the CORS extensions. We added the CORS handler, which gives us all the extensions, with the right configuration.");

    let host = Host::unsecure(
        "localhost",
        "non-existent-directory",
        extensions,
        host::Options::default(),
    );
    // Consider using `.insert` here instead of `.default`.
    // The reason I had to use `.default` is a small issue in v0.4.0, patched in the next version.
    let data = HostCollection::builder().default(host).build();
    let port = PortDescriptor::unsecure(8080, data);
    let handle = RunConfig::new().bind(port).execute().await;

    println!("Started server at http://localhost:8080/");
    println!("Try http://127.0.0.1:8080/ for the IPv4 version and http://[::1]:8080/ for IPv6.");
    println!(
        "Test going to the page in a browser and then run curl on it; you'll get different results."
    );
    println!("Shutting down in 10 seconds.");

    let sendable_server_handle = Arc::clone(&handle);

    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_secs(10)).await;
        println!("Starting graceful shutdown");
        sendable_server_handle.shutdown();
    });

    handle.wait().await;

    println!("Graceful shutdown complete.");
}
```
