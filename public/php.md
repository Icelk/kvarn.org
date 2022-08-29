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

Mount the [PHP extension](https://doc.kvarn.org/kvarn_extensions/php/fn.mount_php.).
Now, all queries ending in `.php` will be redirected to the FastCGI server at `connection`.
You can add additional predicates for capturing pages to be served by PHP.

Also consider the [working directory version](https://doc.kvarn.org/kvarn_extensions/php/fn.mount_php_with_working_directory.)
of the `mount_php` function. It allows for PHP usage on a limited route on your web application.

> Some of these features are not available before v0.4.0.

# WordPress

WordPress should work without any further work.

If you're using [Kvarn search](https://github.com/Icelk/kvarn-search), enable the `Options::index_wordpress_sitemap` flag to automatically index the sitemap supplied by WordPress.
