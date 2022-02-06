!> hide

<head>
    <title>Chute - Markdown support | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="The Chute tool utilizing Kvarn templates to give comprehensive Markdown support.">
    [highlight]
</head>

# Chute

To easen writing for the web, Kvarn offers a tool called Chute. It consumes Markdown documents and produces HTML documents.

Chute is a CLI tool. It can be built from the [source](https://github.com/Icelk/kvarn/tree/main/chute). Linux downloads are available on [GitHub actions](https://github.com/Icelk/kvarn/actions/workflows/chute.yml).

## Present extensions

Using [Present extensions](/extensions/#present) gives you power to control the content of the document.
Chute is smart and merges the present extensions in the MD file and the hard-coded template HTML document.
This allows you to specify any present extensions, just as you would in HTML.

### Hide exception

If you define the `hide` extension in your Markdown document (e.g. `!> hide\n...`) the Markdown document is hidden from the website.

Chute removes this extension when merging.

To also hide the HTML, you can specify it twice (e.g. `!> hide &> hide`).

## Table of contents

Chute supports several special tags. They have the format `\${tag}`.

If you use `\${toc}`, Chute outputs a table of contents from the headings in your document.

As you may have noticed, I was able to write `\${toc}` in the document.
That's because you can escape tags by inserting a backslash (`\`) before the tag.

## \<head\>

If you need to insert items into the \<head\> of your document, simply define it at the top:

> The present extensions are not required for this to work.

```markdown
!> hide &> my-present-extension

<head>
    <title>Fun article</title>
</head>

Text...
```
