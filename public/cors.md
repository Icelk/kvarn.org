!> hide

<head>
    <title>CORS | Kvarn</title>
    <meta name="permalinks" content="enabled"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="What is CORS? When and how to use it. We'll also cover it's itegration with Kvarn.">
</head>

The infamous technology every backend developer fights. Well, not when using Kvarn (shameless self-promotion).

${toc}

# About

CORS stands for *cross-origin resource sharing*. As the name implies, it allows websites to use resources from other websites.

> This is heavily used by larger websites to serve static content (e.g. images, video) from *content delivery networks*.

The protections CORS enforces are critical. Let's say a malicious actor, Ted, wants to get money from you. In a world without CORS, Ted could issue a request on your browser to your bank and transfer money.
