!> hide
<head>
    <title>Outfacing errors | Kvarn</title>
</head>

These are ordered from first to last in accordance to the request's [pipeline](/pipeline.).

Both HTTP errors and logged warnings/error are listed here.

${toc}

# Debugging

The logged errors are useful. See the [log crate](https://docs.rs/log/latest/log/#in-executables) for more info.

All HTTP errors originating from Kvarn contain a `reason` header which contains more info about the issue.
If the error response isn't [overridden](#overriding-http-errors), it's also contained in the body.

# Overriding HTTP errors

Put the HTML file in `errors/xxx.html` to return that in case of an error.
You can use Present extensions here, as with any other file.

> In the future, you should be able to control this through other extensions (e.g. prepare extensions).

# IO errors

Any errors writing to the stream will result in a log error and an aborted connection.

Errors in reading the body is however handled the user.

## Connecting

Errors on initial connection and reading errors will also abort the connection and log.

## Reverse proxy

Erroneous responses and timeouts will result in `502` and `504` errors, respectively.

# Not acceptable

If the request contains accept requirements which could not be fulfilled, a `406` is returned.

## Byte range 

The same goes for the built in byte ranges - if they're out of bounds, a HTTP error is send back.

# 404 Not Found

If no file was found (or the [FS option](https://doc.kvarn.org/kvarn/host/struct.Options.html#structfield.disable_fs) is disabled), and no prepare extension was found, a `404` is generated. This can in turn be modified by a package extension. That is however almost never the correct thing.

# Illegal paths

Some paths are disallowed by Kvarn due to [security reasons](http://localhost:8080/security/#strict-request-checks).
These include (though are not exclusive) `./` and `//`.
This will return a `400`.
