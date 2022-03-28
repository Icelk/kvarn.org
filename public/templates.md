!> hide

<head>
    <title>HTML Templates | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="How to use HTML templates through the Kvarn templating engine.">
</head>

A goal of the Kvarn web server is to be modular. It's also designed to be _fast_. Therefore, some default tools are provided to give good performance. You can naturally write other tools with the same level of integration as the Kvarn-branded ones.

Kvarn's templating engine works using a [present extension](extensions/#present) to expand template names.
The extension takes arguments of which templates to include (e.g. `!> tmpl standard.html markdown.html`).
It reads those files in the `templates/<template file>`. `templates/` is a sibling of the `public` directory.

> This system also works for file types other than HTML. The same pattern of template files (preferably with the same extension as the file being templated) and present extensions works.

You can define templates (in e.g. `templates/standard.html`) using names inside brakets prepended by a dollar sign: `\$[template name]`. Everything after the template name (a space or newline is required after) is part of that template.

In your document, include templates by writing their name in brackets the same was as described above. The text will be "copy and pasted" to override the template. These don't have to have newlines or spaces after them.

> The template definitions and usages can be indented. This allows formatting tools to run.

# Escaping

If you don't want a template, but only brackets `\$[]`, you can escape. Just insert a backslash `\` before: `\​\$[]`.

> See [/chute/#escaping](/chute/#escaping) on how to write the above in Markdown source. The same applies to this.

If you see an unwanted `\` in the HTML, consider removing the escape. It shouldn't be needed.
See the section below for some exceptions.

# Issues with square brackets \\$[]
See [/chute/#issues-with-square-brackets](/chute/#issues-with-square-brackets-) and
[/chute/#escaping](/chute/#escaping).

## Limitations

You can't start a line with `\$[` (or just have whitespace before) (even when using escaping) in a template.
This is due to how data is copied from templates.
