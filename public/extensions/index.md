!> hide
<head>
    <title>Extensions</title>
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

## Prime

- [ ] Not cached

This is where you can add cache redirects.
If you for example want to load the login page on all privileged pages (when the user is not logged in),
you can check for the `authentication` HTTP header
and from there decide to intercept the request.

It is also here where all HTTP requests are upgraded to HTTPS, by redirecting the request to 
a special page where a 307 redirect is responded with.

## Prepare

- [x] Optional. If the response contains a future (WebSockets), it'll never cache.

You provide either a URI or a function of when to activate your code.
Will still get all other extensions applied.

You have to handle all HTTP methods, as Kvarn passes all, except for `HEAD`, which it handles by simply omitting the body.

It's very useful for APIs (both REST and GraphQL!)

Here, you could, for example, implement reading from the file system, like Kvarn does by default.

## Present

- [x] Cached

Here, files can opt in to extensions to manipulate data, such as the template system and `hide` extension.

This type can modify most data in response and will be executed in series.

Extensions can also attach to filetypes.

## Package

- [ ] Not cached

Here, you can define headers to add to the final response.
These headers are not cached, but applied every time. You can therefore compare things like other headers and the version of the request.

Cookies can be defined here, since they won't be cached.

## Post

- [ ] Not cached

These extensions are called after all data are written to the user. This will almost exclusively be used for HTTP/2 push.

Maybe, it can be used to sync data to a database after the request is written to not block it?
