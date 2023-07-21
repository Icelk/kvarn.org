!> hide

<head>
    <title>Chute - Markdown support | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="The Chute tool utilizing Kvarn templates to give comprehensive Markdown support.">
</head>

# Chute

To easen writing for the web, Kvarn offers a tool called Chute. It consumes
Markdown documents and produces HTML documents.

Chute is a CLI tool. Downloads are
[available](https://github.com/Icelk/moella/releases/). Nightly Linux downloads
are available on
[GitHub actions](https://github.com/Icelk/kvarn/actions/workflows/chute.yml).

${toc}

## Present extensions

Using [Present extensions](/extensions/#present) gives you power to control the
content of the document. Chute is smart and merges the present extensions in the
MD file and the hard-coded template HTML document. This allows you to specify
any present extensions, just as you would in HTML.

### Hide exception

If you define the `hide` extension in your Markdown document (e.g.
`!> hide\n...`) the Markdown document is hidden from the website.

Chute removes this extension when merging.

To also hide the HTML, you can specify it twice (e.g. `!> hide &> hide`).

### Templates

Using the [templating engine](/templates.), you can easily build a website
structure with Chute.

See the page linked above for more details.

Chute inserts some templates before and after the content automatically. Before
dependencies: `!> tmpl standard.html markdown.html\n\$[head]`\
After dependencies: `\$[dependencies]\$[md-imports]\$[close-head]\$[navigation]\n<main><md>`\
After body: `</md></main>\n\$[footer]\`

## Anchors

Chute sets the id of all headings to their content. The heading is converted to
lower-case and non-alphanumerical symbols are replaced by hyphens `-`.

This means you can [link to headings](#anchors) of your document. The above link
was written as `[link to headings](#anchors)` in Markdown source.

## Tags

Chute supports several special tags. They have the format `\${tag}`. If a tag
doesn't exist in the internal list, or is [escaped](#escaping), it's simply left
intact.

### Table of contents

If you use `\${toc}`, Chute outputs a table of contents from the headings in
your document.

### Escaping

As you may have noticed, I was able to write `\${toc}` in the document. That's
because you can escape tags by inserting a backslash (`\`) before the tag:
`\​\${tag}`.

To write `\​\${tag}` in a document, you have to do the following:
`\<zero-width space>\​\${tag}`. This is caused by Chute parsing the Markdown
source and looking for tags and escapes. If two successive backslashes `\` are
found, it expands the tag as usual. In normal Markdown, this is converted to a
single backslash. In code blocks, however, Markdown doesn't remove the extra
backslash. We therefore insert a character in between to make Chute escape the
last backslash, but only leave one. The zero-width space makes sure it isn't
visible when viewing the document.

## \<head\>

If you need to insert items into the \<head\> of your document, simply define it
at the top:

> The present extensions are not required for this to work.

```html
!> hide &> my-present-extension

<head>
    <title>Fun article</title>
</head>

Text...
```

## Issues with square brackets \\$[]

When using square brackets (often found in Rust code and `Cargo.toml` files),
the [Kvarn templating engine](/templates.) tries to find a template. The text
will therefore disappear and issues arise. You can escape this using two
backslashes in Markdown source: `\$[]` or one backslash in code segments.
