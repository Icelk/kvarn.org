!> hide
<head>
    <title>Search | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Full text search engine for your site. Returns results as you type. No index setup.">
</head>

# Kvarn search

Over Christmas, I made a [full text search engine](https://github.com/Icelk/elipdotter).
You can read my [article](https://icelk.dev/articles/search-engine.html) for more details.

Now, you can easily set up a API endpoint for search on your website, powered by Kvarn.

Using the [`kvarn-search`](https://github.com/Icelk/kvarn-search) crate
(for now, not on [crates.io](https://crates.io) as it requires new Kvarn APIs),
you can add a search engine to Kvarn and customize it.

See [these two lines](https://github.com/Icelk/kvarn-reference/blob/main/src/hosts.rs#L220-L221) from the reference implementation for an example on how to set it up.

## Integrations

This will index all the pages of the site (except those provided by [PrepareFn](https://doc.kvarn.org/kvarn/extensions/struct.Extensions.html#method.add_prepare_fn)).

Check out [the WordPress integration here](php.#wordpress).

## Frontend

[This function](https://github.com/Icelk/icelk.dev/blob/3525fb532f18a1d532ca08046fabe21a95c6e73d/public/script.js#L237-L395) handles the searching in JS.\
[This HTML](https://github.com/Icelk/icelk.dev/blob/3525fb532f18a1d532ca08046fabe21a95c6e73d/templates/standard.html#L105-L127) is the search bar.\
[And this](https://github.com/Icelk/icelk.dev/blob/3525fb532f18a1d532ca08046fabe21a95c6e73d/public/style.css#L350-L434) is the styling.
