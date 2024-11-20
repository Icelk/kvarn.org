!> hide

<head>
    <title>Mölla</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Kvarn with a simple yet extensive config format and zero downtime.">
    <style>
        main md {
            /* so the code snippets are clearer */
            max-width: 106ch;
            max-width: min(90%, 106ch);
        }
    </style>
</head>

Mölla (often written moella, pronounced /mœla/ (œ as in b**ir**d with a British
accent)) is a binary that reads config file(s) and spinns up a Kvarn web server.
It supports all the major Kvarn extensions and presents most options Kvarn
supports.

Mölla can serve multiple hosts on a single server (with automatic
certificates!), extending to serving multiple sets of hosts on different ports /
NICs—all within 1 process. When you run `kvarnctl reload`, Mölla will restart
and load any changes made to the config (or run a new version of the binary),
with 0 milliseconds of downtime.

# Getting started

## cargo install

Moella is [available at crates.io](https://crates.io/crates/moella). You can
install it using `cargo install moella`. Alternatively, you can download
pre-built binaries:

## Download binary

Download the binary for your platform from
[this page](https://github.com/Icelk/moella/releases).

-   Platform specifics:
    -   If you run Linux: run `chmod +x <downloaded binary>` to make it
        executable.
    -   If you run macOS: run `chmod +x <downloaded binary>`, then open Finder
        and find the binary. Right click and press `Open`. Accept the warning.
    -   On Windows, it should just run
-   Lastly, run the command `./<downloaded binary> --help` (maybe replace `/`
    with `\` on Windows) in your shell (`cmd.exe` in Windows) to get usage
    information.

Now, create a Mölla config in a file named `host.ron`:

```ron
// My Moella config
(
    extensions: {
        "website": [ AllDefaults ]
    },
    hosts: [
        Http (
            name: "mywebsite.org",
            path: "./",
            extensions: ["website"],
            options: (
                disable_client_cache: true,
                disable_server_cache: true,
            )
        )
    ],
    ports: Standard(Host("mywebsite.org")),
)
```

Next, run the web server using
`./<downloaded binary> --config host.ron --high-ports` and go to
`http://localhost:8080`. The contents of `./public/index.html` will be loaded in
your browser (refresh page to update content). The `--high-ports` tells Mölla to
use port 8080 instead of 80 (the default for the unencrypted web), because you
have to run `sudo` to get access to port 80 on Linux.

# Config schema

Here, all the options of the config are documented.

```ron
// optional to specify `KvarnConfig`
// all paths in the config will always be relative to the config's location
KvarnConfig (
    // Import other config files to add to the set of `extensions` and `hosts`.
    //
    // Note that only one config file can define `ports` (see at the end of the config)
    //
    // So say you have a common extension set for all you hosts,
    // then all those configs can load `extensions.ron` and this (main) config
    // in turn import those. Any one of the configs can define the `ports` parameter.
    //
    // This prints a warning if loading a config failed, but it isn't considered critical.
    //
    // When you define a host collection twice with the same name,
    // imported hosts are appended to the host collection
    // Or, you can simply use `All` when binding to a port.
    import: ["other-host.ron"],

    // all options are optional unless labled `required`
    // Please note that globbing (usage of "*") generally only works as the first or last character
    extensions: {
        // define sets of extensions, and then add one or more sets of extensions to hosts
        // several of the same extension can be used (if they don't override the previous)
        // the name is arbitrary and is just used as a name
        "icelk": [
            // don't add the default extensions: https://doc.kvarn.org/kvarn/extensions/struct.Extensions.html#method.new
            NoDefaults,

            // the following are excluded when using `NoDefaults`, but present by default
            // Redirect `/kvarn/` to `/kvarn/index.html`, very important
            RedirectIndexHtml,
            Referrer(None),
            CorsSafe,
            CspSafe,
            // https://kvarn.org/nonce.html
            Nonce,
            // If HTTPS is available, redirect all users to it
            RedirectHttpToHttps,

            // Add all quality of life extensions: https://doc.kvarn.org/kvarn_extensions/fn.mount_all.html
            //
            // adds the present internal extensions
            // [ "download", "cache", "hide", "private" (same as hide),
            //  "allow-ips", "tmpl" (templates), and "push" (HTTP/2 push) ]
            AllDefaults,
            // Adds template support: https://kvarn.org/templates.html
            Templates,
            // Adds HTTP/2 push: https://kvarn.org/push.html
            Http2Push (
                // interval before we push again
                push_interval: 120,
                // every nth request to check if we should push again
                check_every_request: 8,
            ),

            // Only runs if predicate is true
            If (
                // required
                // predicate can also be Not(a), And ([a,b,c,..]), and Or ([a,b,c,..])
                predicate: Exists("../php/cgi-bin"),
                // required
                // can be any other extension
                // this is an example of PHP support: https://kvarn.org/php.html
                extension: Php (
                    // required
                    // tcp:// and udp:// are also available
                    connection: "unix:///var/run/php-fpm.sock",
                    // required
                    // where on the website to capture all requests
                    capture_route: "/cgi-bin/",
                    // required
                    // kvarn shutdown down if this doesn't exist
                    working_directory: "../php/cgi-bin",
                )
            ),
            // The first is a filter:
            // filters can have the same logical operators as predicates (see PHP above),
            // but support `Exact`, `StartsWith`, `EndsWith`, and `Contains` in regard to the
            // request path, instead of file system queries.
            //
            // So this extensions redirects the user agent to kvarn.org
            // on all pages under the directory `public/kvarn`
            Redirect (StartsWith("/kvarn/", "https://kvarn.org")),
            // tell the web browser to cache:
            // `Changing` = 2 minutes, `Full` = 2 years, `None` = no caching, `MaxAge(seconds)`, `Ignore` = don't change the HTTP header
            ClientCache ({
                ".png": Changing,
                ".avif": Full,
                ".jpg": Full,
                ".ico": Full,
                ".woff2": Full,
                "/highlight.js/": Full,
            }),
            // https://kvarn.org/csp.html
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
            Csp ({
                // Bases `CspRule` on the defaults (allow requests to self and inline style tags)
                "*": FromDefault ({ img_src: [ Uri ("https://kvarn.org") ] }),
                // Bases `CspRule` on the rule found at `/`
                "/index.html": Inherit ("/", { script_src: [ UnsafeInline ] }),
                // the following two are equivalent (except for the route they match, of course)
                // Empty tells Kvarn to not touch CSP
                "/api/*": FromEmpty ({}),
                "/ip": Empty,
                "/ulogger/*": FromDefault ({
                    default_src: [
                        Uri ("https://maps.googleapis.com"),
                        Uri ("https://maps.gstatic.com")
                    ],
                    img_src: [
                        Uri("https://*.openstreetmap.org"),
                        Uri("https://maps.googleapis.com"),
                        Uri("https://maps.gstatic.com"),
                        Scheme("data:"),
                    ],
                }),
                "/admin": FromDefault ({ default_src: [ UnsafeInline ] }),
                "/quizlet-learn/login.html": FromDefault ({ default_src: [ UnsafeInline ] }),
                "/articles/*": FromDefault ({
                    style_src: [
                        UnsafeInline,
                        Uri("https://fonts.googleapis.com"),
                        Uri("https://fonts.googleapis.com"),
                    ],
                    default_src: [ Uri("https://fonts.gstatic.com") ],
                }),
            }),
            // https://kvarn.org/cors.html
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
            Cors ({
                // cache is optional and in seconds (client side)
                // origins is required to not be empty
                // methods is optional
                //
                // If "*" is present in `origins`, all origins are allowed
                // If `All` is present in `methods`, all methods are allowed
                "/logo.svg": ( cache: 1209600, origins: ["https://github.com", "https://doc.kvarn.org"] ),
                "/favicon.svg": ( cache: 1209600, origins: ["https://doc.kvarn.org"] ),
                "/images/*": ( origins: ["https://icelk.dev"], methods: [POST] )
            }),

            // https://kvarn.org/reverse-proxy.html
            ReverseProxy (
                // required
                // The part of the website to capture
                route: "/private-ical/",
                // required
                // connection to backend server. Assumes HTTP/1.1 without TLS.
                // tcp: is an alias to http:
                // udp: and unix: can also be used, but they also use HTTP, but over a different transport
                connection: "http://localhost:5232",
                // in seconds, decimals are allowed
                timeout: 10,
                options: [
                    // adds header before sending to backend server
                    AddHeader("x-script-name", "/private-ical"),
                    // The actual pattern to strip by is determined by the host's `folder_default`
                    StripIndexHtml (
                        // optional override
                        index_html_name: "index.html"
                    ),
                    // Forward the real IP as `x-real-ip`
                    // Because the backend server just sees the IP of the Kvarn server, this can be used to get the real IP of the user agent
                    ForwardIp,
                    // Disable URL rewrite (so the request URL isn't modified)
                    // Advanced, not recommended
                    DisableUrlRewrite,
                ]
            ),
            // https://kvarn.org/security/#authentication
            // Explanation of options: https://doc.icelk.dev/kvarn-auth/kvarn_auth/struct.Builder.html
            Auth (
                // required
                credentials: SpaceSepparatedAccoutPerLine("quizlet-learn.passwd"),
                // required
                // `TODO`: allow user to specify a public (validation) key instead of the private (secret) key.
                secret: "quizlet-learn.secret",
                // required
                auth_api_route: "/quizlet-learn/auth",
                // required (is usually a page telling the user they're unauthorized or the login page)
                unauthorized_route: "/quizlet-learn/login.",
                // required
                // Can only be StartsWith or AcceptAll
                // where the authentication is enforced
                filter: StartsWith("/quizlet-learn/"),
                // time between authentication token refreshes.
                // higher intervals decreases auth server load, but if someone steals a user's
                // JWT, they have full, irrevocable access for the duration of this interval
                jwt_refresh_interval: 3600,
                // see https://docs.rs/kvarn-auth/0.1.0/kvarn_auth/struct.Builder.html
                lax_samsite: false,
                // Allows reading the auth cookies from JavaScript
                relaxed_httponly: false,
                force_relog_on_ip_change: false,
                jwt_cookie_name: "auth-jwt",
                credentials_cookie_name: "auth-credentials",
                // use `x-real-ip` header instead of connection address for IP check
                behind_reverse_proxy: true,
            ),

            // counts the views of all HTML pages
            ViewCounter (
                // required
                filter: StartsWith("/"),
                // required
                log_path: "../icelk-views",
                // default is to write to disk every hour
                commit_interval: 3600,
                accept_same_ip_interval: 3600,
            )
        ],
    },
    hosts: [
        // Multiple hosts with the same name isn't supported for obvious reasons.
        // Here, the same host is shown using all methods of defining a host
        Plain (
            // Doesn't need name parameter as that's read from the certificate

            // The certificate and private key need to be in the PEM format (which is the most common)
            // If `auto_cert` is enabled, the cert and pk files don't need to exist.
            // required
            // path to cert
            cert: "icelk-cert.pem",
            // required
            // path to pk
            pk: "icelk-pk.pem",
            // Automatically get and renew the certificate for this host
            // Assumes the host is serving the domain you specified as your `name`.
            // default = false
            auto_cert: true,
            // required
            // the path to read templates, errors, and public files from
            path: "../icelk.dev",
            // required
            // can add multiple lists of extensions
            extensions: ["icelk"],
            // you can however override the name, if you for example use a self-signed cert
            name: Some("icelk.dev"),
            // all the values are optional
            options: (
                // don't serve files from the file system
                disable_fs: false,
                no_http_to_https_redirect: true,
                disable_client_cache: false,
                disable_fs_cache: false,
                disable_response_cache: false,
                disable_server_cache: false,
                // compresson level
                // the actual defaults are listed here
                brotli_level: 4,
                // compresson level
                gzip_level: 2,
                zstd_level: 4,
                // compresson level for when the response isn't cached
                brotli_oneshot_level: 3,
                gzip_oneshot_level: 1,
                zstd_oneshot_level: 1,
                // Tell browsers to only use HTTPS when connecting to us.
                // Use with care, since setting this will disallow browsers
                // from connecting to your website via HTTP for the next two years!
                // off by default
                hsts: true,
                // you might want to change the following if you use PHP on your entire website
                // redirect `/kvarn/` to `/kvarn/index.html` (this is the default)
                folder_default: "index.html",
                // redirect `/icelk.` to `/icelk.html` (this is the default)
                extension_default: "html",
                // The directory to serve files from.
                // If you set this to `.`, make sure no certificates are exposed at `path`!
                public_data_directory: "public",
                // limit the number of requests from an IP
                limiter: Limit (
                    // all of these are required
                    max_requests_per_interval: 10,
                    interval: 10.3,
                    check_one_in_n_requests: 10,
                ),
                // Disable limiter
                limiter: AllowAll,
            ),
            addons: [
                // see https://docs.rs/kvarn-search/latest/kvarn_search/struct.Options.html
                SearchEngine (
                    // required
                    api_route: "/search",
                    // required
                    kind: Lossless,
                    // example value
                    ignore_paths: ["/private"],
                    force_refresh: true,
                    word_count_limit: 2_500,
                    response_hits_limit: 10,
                    query_max_length: 100,
                    query_max_terms: 10,
                    additional_paths: [],
                    index_wordpress_sitemap: true,
                ),
                // Options for automatically getting and renewing the certificate for this host
                AutomaticCertificate (
                    // optional, but the format of `mailto:` and then your mail address is required
                    contact: "mailto:main@icelk.dev"
                    // optional, does not need to be persistent, but it's recommended
                    // defaults to `./lets-encrypt-credentials-<your-contact>.ron`
                    account_path: "/tmp/my-lets-encrypt-account.ron"
                    // force certificate renewal on webserver start
                    // not recommended to enable this, unless you need to force renewal
                    // please disable it again then
                    force_renew_on_start: false,
                )
            ],
        ),
        // tries to load the certificates, but falls back to only serving unencrypted HTTP
        // if that fails.
        TryCertificatesOrUnencrypted (
            // required (because we can't be sure we can read the name from the cert if the cert fails)
            name: "icelk.dev",
            // required
            // If `auto_cert` is enabled, the cert and pk files don't need to exist.
            cert: "icelk.cert",
            // required
            pk: "icelk.pk",
            // Automatically get and renew the certificate for this host
            // Assumes the host is serving the domain you specified as your `name`.
            // default = false
            auto_cert: true,
            // required
            path: "../icelk.dev",
            // required
            extensions: ["icelk"],
            // all the values are optional
            // HostOptions is optional (you can have just parentheses) (just like with KvarnConfig)
            // see Plain
            options: HostOptions (
                // these are the alternative names your site will also be recognized by
                // Are read from the certificate (therefore, you can't set this for Plain hosts)
                alternative_names: ["icelk.com"],
                hsts: true,
            ),
            // see Plain
            addons: [],
        ),
        Http (
            // required
            name: "doc.icelk.dev",
            // required
            path: "../icelk.dev/docs",
            // required
            extensions: [],
            // like Plain, except no_http_to_https_redirect
            // all the values are optional
            options: (),
            // see Plain
            // `AutomaticCertificate` isn't valid for `Http`.
            addons: [],
        )*/
    ],
    // only required if you want to use `Collection` as a port source.
    // When you define a host collection twice with the same name,
    // hosts (e.g. those loaded from imports) are appended to the host collection
    host_collections: {
        "s": [/* unused */],
    },
    ports: Map({
        8080: ( encrypted: false, source: All ),
        8443: ( encrypted: true, source: All ),
    }),
    // or
    // here, Host() can also be Collection() or All
    // Standard binds 80 (HTTP (with redirect to HTTPS, if that's enabled)) and 443 (HTTPS)
    ports: Standard(Host("icelk.dev")),
    // or
    ports: HttpOnly(Hosts(["icelk.dev", "kvarn.org"])),
    // or HttpsOnly
)
```

That's the whole config!

# Command line options

-   `--high-ports` avoid port permission problems on Linux by binding to 8080
    and 8443
-   `-c | --config <CONFIG FILE>` tells Mölla which config to use
-   `-d | --host <DEFAULT HOST>` for local development, which host to show if
    you have several defined
-   `-p | --ctl-path <INSTANCE>` the instance name / control socket path to use.
    This is critical to change if you want multiple instances of Mölla to run on
    the same machine. If you run Mölla again with the same `INSTANCE`, it will
    take over and shut down the previous. You must specity the same `INSTANCE`
    when running [`kvarnctl`](/ctl/)

# History and why this exists

Before Mölla, you had to write the host and extension descriptors in Rust, and
recompile after every change. This made for a way too high barrier to entry and
way too slow development cycle. For [icelk.dev](https://icelk.dev), I need
[custom extensions](https://github.com/Icelk/icelk.dev/blob/6127d3f/icelk.dev.ron#L93-L95),
which are
[easily integrated](https://github.com/Icelk/icelk.dev/blob/659df7f/server/src/main.rs#L15-L19)
into Mölla!

# Examples

## [kvarn.org](/) and [doc.kvarn.org](https://doc.kvarn.org)

You might notice the following doesn't include a `ports` property. That's due to
this config being imported from another. Since the main config contains
`ports: Standard(All)`, all the hosts defined here are included.

You may also notice that the extension set `base` isn't found anywhere. That's
because it's defined in the "parent" config that imports this. The implicit
usage of undefined extension sets might be deprecated in the future (forcing you
to import the relevant config in this file too, instead of relying on the parent
config).

```ron
(
    extensions: {
        "kvarn": [
            Cors({
                "/logo.svg": ( cache: 1209600, origins: ["https://github.com", "https://doc.kvarn.org"] ),
                "/favicon.svg": ( cache: 1209600, origins: ["https://doc.kvarn.org"] ),
            })
        ],
        "kvarn-doc": [
            Redirect(Exact("/index.html"), "kvarn/"),
            Csp({
                "/*": FromDefault({ img_src: [ Uri("https://kvarn.org") ] }),
            }),
        ]
    },
    hosts: [
        Plain (
            name: "kvarn.org",
            cert: "kvarn-cert.pem",
            pk: "kvarn-pk.pem",
            auto_cert: true,
            path: "./",
            extensions: ["base", "kvarn"],
            options: (
                disable_client_cache: true,
                disable_server_cache: true,
                hsts: true,
            ),
            addons: [
                SearchEngine (
                    api_route: "/search",
                    kind: Lossless,
                    ignore_paths: ["/rsync-ignore"],
                )
            ],
        ),
        Plain (
            cert: "doc.kvarn-cert.pem",
            pk: "doc.kvarn-pk.pem",
            path: "../kvarn/target/doc",
            extensions: ["base", "kvarn-doc"],
            // for development self-signed cert
            name: Some("doc.kvarn.org"),
            options: (
                disable_client_cache: true,
                disable_server_cache: true,
                public_data_directory: ".",
                hsts: true,
            ),
        ),
    ],
)
```
