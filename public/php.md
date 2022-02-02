!> hide
<head>
    <title>PHP support | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Details on the usage and implementation of PHP / FastCGI in Kvarn.">
</head>

PHP support is now production ready.

I use it to serve [PostfixAdmin](https://github.com/postfixadmin/postfixadmin) for my mail servers.

The implementation works by capturing requests and serving them by sending a request to a FastCGI server at a provided location (such as a UNIX socket or UDP port).
Then, the body is returned if no errors were reported.

# Usage

Simply mount the [PHP extension](https://doc.kvarn.org/kvarn_extensions/php/fn.mount_php.html).
Now, all queries ending in `.php` will be redirected to the FastCGI server at `connection`.
You can add additional predicates for capturing pages to be served by PHP.

> Some of these features may not be available before v0.4.0. Consider using the git version.

# WordPress

WordPress should work without any further work.

If you're using [Kvarn search](https://github.com/Icelk/kvarn-search), enable the `Options::index_wordpress_sitemap` flag to automatically index the sitemap supplied by WordPress.
