!> hide

<head>
    <title>kvarnctl</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Communication with Kvarn from the command line.">
</head>

`kvarnctl` is a binary available for UNIX systems. It commnicates with your
Kvarn instances to execute commands with arguments.

Downloads are [available](https://github.com/Icelk/moella/releases/). Nightly
Linux downloads are available on
[GitHub actions](https://github.com/Icelk/kvarn/actions/workflows/kvarnctl.yml).

# Commands

These correspond to [plugins](https://doc.kvarn.org/kvarn/ctl/index.html).

## `shutdown`

Shut the Kvarn instance down.

If the `graceful-shutdown` [cargo feature](/cargo-features.) is enabled, this
performs a graceful shutdown (no connections are abruptly terminated). You can
implement your own shutdown mechanism.

## `ping`

Pings Kvarn. The response will be all the arguments joined with spaces

## `reload`

Starts a new instance in place and performs a graceful shutdown. Requires both
the capabilities necessitated by [`shutdown`](#shutdown) and that the OS is UNIX
& !Solaris & !illumos. This is also what
[is required by handover](/shutdown-handover.#handover).

If handover isn't available, there will be a small gap where no listener is
online - if someone requests the webpage during the ~0.4s window, they get a
`Server couldn't be reached` error from their browser.

If the argument `wait` is passed (`kvarnctl reload wait`), the command doesn't
return until the old instance has been shut down.

## `wait`

Waits for the Kvarn instance to shut down.

## `clear`

Format: `kvarnctl clear <method> (<host> <file/URI>)`

Clears caches. Methods available are `all`, `files`, `responses` (these
optionally take a host to clear), and two which clear a specific resource,
`file` and `response`.

# Waiting for Kvarn to turn off

If you want to wait for when Kvarn turns off, use the `--wait` flag. The
advantage of using the flag instead of the command is that the command returns
when an instance is shut down. The flag handles reloads, so it'll still wait
after a reload, for a `shutdown` (or anything else that makes Kvarn shut down).

> This is accomplished by trying to reconnect once the `wait` command returns.

# Path

By default, Kvarn listens on `/run/user/<uid>/kvarn.sock` for users and
`/run/kvarn.sock` for root users. You can
[change this](https://doc.kvarn.org/kvarn/struct.RunConfig.html#method.set_ctl_path).

## Disable

You can also
[disable the IPC altogether](https://doc.kvarn.org/kvarn/struct.RunConfig.html#method.disable_ctl).
