!> hide

<head>
    <title>kvarnctl</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Communication with Kvarn from the command line.">
</head>

`kvarnctl` is a binary available for UNIX systems. It commnicates with your Kvarn instances to execute commands with arguments.

# Commands

These correspond to [plugins](https://doc.kvarn.org/kvarn/ctl/index.html).

## `shutdown`

Shut the Kvarn instance down.

If the `graceful-shutdown` [cargo feature](/cargo-features.) is enabled, this performs a graceful shutdown (no connections are abruptly terminated).
You can implement your own shutdown mechanism.

## `ping`

Pings Kvarn. The response will be all the arguments joined with spaces

## `reload`

Starts a new instance in place and performs a graceful shutdown.
Requires both the capabilities necessitated by [`shutdown`](#shutdown) and that the OS is UNIX & !Solaris & !illumos.
This is also what [is required by handover](/shutdown-handover.#handover).

# Path

By default, Kvarn listens on `/tmp/kvarn.sock`. You can [change this](https://doc.kvarn.org/kvarn/struct.RunConfig.html#method.set_ctl_path).

## Disable

You can also [disable the IPC altogether](https://doc.kvarn.org/kvarn/struct.RunConfig.html#method.disable_ctl).
