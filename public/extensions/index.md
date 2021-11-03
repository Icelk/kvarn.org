!> hide
<head>
    <title>Extensions | Kvarn</title>
    [highlight]
</head>

To extend the core functionality of Kvarn, you'll use *extensions*.
They provide options for attaching to all parts of the request pipeline,
with little overhead compared to cloning Kvarn and integrating with the internal code.

${toc}

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

- [ ] Not cached

This is where you can add cache redirects.
If you for example want to load the login page on all privileged pages (when the user is not logged in),
you can check for the `authentication` HTTP header
and from there decide to intercept the request.

It is also here where all HTTP requests are upgraded to HTTPS, by redirecting the request to 
a special page where a 307 redirect is responded with.

## [Prepare](https://doc.kvarn.org/kvarn/macro.prepare.html)

- [x] Optional. If the response contains a future (WebSockets), it'll never cache.

You provide either a URI or a function of when to activate your code.
Will still get all other extensions applied.

> The `path` variable you get here will be `None` if the `fs` feature of a `Host` isn't enabled or percent decoding failed.
> Be sure to handle percent encoding when taking the `request.uri().path()`. Using the `path` handles this for you.

You have to handle all HTTP methods, as Kvarn passes all, except for `HEAD`, which it handles by simply omitting the body.

It's very useful for APIs (both REST and GraphQL!)

Here, you could, for example, implement reading from the file system, like Kvarn does by default.

## [Present](https://doc.kvarn.org/kvarn/macro.present.html)

- [x] Cached

Here, files can opt in to extensions to manipulate data, such as the template system and `hide` extension.

This type can modify most data in response and will be executed in series.

Extensions can also attach to filetypes.

## [Package](https://doc.kvarn.org/kvarn/macro.package.html)

- [ ] Not cached

Here, you can define headers to add to the final response.
These headers are not cached, but applied every time. You can therefore compare things like other headers and the version of the request.

Cookies can be defined here, since they won't be cached.

## [Post](https://doc.kvarn.org/kvarn/macro.post.html)

- [ ] Not cached

These extensions are called after all data are written to the user. This will almost exclusively be used for HTTP/2 push.

Maybe, it can be used to sync data to a database after the request is written to not block it?

# Example

Let's build one of each extension to see how they fit together.

This example requires basic knowledge about Rust to be understood, but the general workflow should be clear.

Note how we create extensions by calling [their respective macros](https://doc.kvarn.org/kvarn/#macros). This does a lot under the hood.

```rust
use kvarn::prelude::*;

#\[tokio::main]
async fn main() {
    env_logger::init();

    let mut extensions = Extensions::empty();

    extensions.add_cors(
        Cors::new()
            .allow(
                "/api*",
                CorsAllowList::new().add_origin("https://icelk.dev"),
            )
            .build(),
    );

    extensions.add_prime(prime!(request, _host, _addr {
        if request.uri().path() == "/" {
            // This maps the Option<HeaderValue> to Option<Result<&str, _>> which the
            // `.and_then(Result::ok)` makes Option<&str>, returning `Some` if the value is both `Ok` and `Some`.
            // Could also be written as
            // `.get("user-agent").and_then(|header| header.to_str().ok())`.
            if let Some(ua) = request.headers().get("user-agent").map(HeaderValue::to_str).and_then(Result::ok) {
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
    }), extensions::Id::new(16, "Redirect `/`"));

    extensions.add_prepare_single(
        "/ip".to_string(),
        prepare!(_request, _host, _path, addr {
            let ip = addr.ip().to_string();
            let response = Response::new(Bytes::copy_from_slice(ip.as_bytes()));
            FatResponse::no_cache(response)
        }),
    );
    extensions.add_prepare_single(
        "/index.html".to_string(),
        prepare!(_request, _host, _path, addr {
            let content = format!(
                "!> simple-head Your IP address\n\
                <h2>Your IP address is {}</h2>",
                addr.ip()
            );
            let response = Response::new(Bytes::copy_from_slice(content.as_bytes()));
            FatResponse::new(response, ServerCachePreference::None)
        }),
    );

    extensions.add_present_internal(
        "simple-head".to_string(),
        present!(present_data {
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
            let title = present_data.args().iter().fold(String::new(), |mut acc, arg| {
                acc.push_str(arg);
                acc.push(' ');
                acc
            });

            let bytes = build_bytes!(start.as_bytes(), title.as_bytes(), middle.as_bytes(), &content, end.as_bytes());
            *present_data.response_mut().body_mut() = bytes;
        }),
    );
    extensions.add_package(
        package!(response, _request, _host {
            response.headers_mut().insert("fun-header", HeaderValue::from_static("why not?"));
            replace_header_static(response.headers_mut(), "content-security-policy", "default-src 'self'; style-src 'unsafe-inline' 'self'");
        }),
        extensions::Id::new(-1024, "add headers"),
    );
    extensions.add_post(
        post!(_request, host, _response_pipe, body, addr {
            if let Ok(mut body) = str::from_utf8(&body) {
                body = body.get(0..512).unwrap_or(body);
                println!("Sent {:?} to {} from {}", body, addr, host.name);
            }
        }),
        extensions::Id::new(0, "Print sent data"),
    );

    // Let's see which extensions are attached:
    println!("Our extensions: {:#?}", extensions);

    println!("Notice all the CORS extensions. We added the CORS handler, which gives us all the extensions, with the right configuration.");

    let host = Host::non_secure("localhost", "non-existent", extensions, host::Options::default());
    let data = Data::builder(host).build();
    let port = PortDescriptor::non_secure(8080, data);
    let server = run(vec!\[port]).await;

    println!("Started server at http://localhost:8080/");
    println!("Try http://127.0.0.1:8080/ for the IPv4 version.");
    println!("Test going to the page in a browser and the curling it, you'll get different results.");
    println!("Shutting down in 10 seconds.");

    let sendable_server_handle = Arc::clone(&server);

    tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(10)).await;
        println!("Starting graceful shutdown");
        sendable_server_handle.shutdown();
    });

    server.wait().await;

    println!("Graceful shutdown complete.");
}
```
