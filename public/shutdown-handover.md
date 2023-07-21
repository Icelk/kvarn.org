!> hide

<head>
    <title>Graceful shutdown & handover | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Kvarn's handling of upgrades to the server and graceful shutdown.">
</head>

Graceful shutdown & handover provide ways to upgrade the server and it's config
with zero downtime or interrupted connections.

Graceful shutdown works by closing the listening socket and completing any
connections.

Handover means the control over a port is handed over from one Kvarn instance to
another. This is achieved through multiple processes binding the same port, and
the old instance then quitting. When both instances are listening, the incoming
request are split between them.

# Handover

This is only available on Unix, see the
[Tokio docs](https://docs.rs/tokio/latest/tokio/net/struct.TcpSocket.html#method.set_reuseport).

## Process

When you restart the Kvarn server,

-   first, the new binary is started. Multiple Kvarn instances can bind to the
    same port, ensuring 0 downtime.
-   Then, The old binary closes it's listeners and instructs all open
    connections to end if a transaction is not in progress.
-   Any transactions (primarily WebSockets) in progress are waited on, while the
    new binary accepts new requests.
-   When all transactions are closed, the old binary silently exits. This means
    if there are any alive connections, Kvarn waits for them to reconnect to the
    new server.

The [communication between binaries](ctl/) are done using Unix sockets (which
isn't a problem since binding to the same port isn't supported on Windows).

# Shutdown

Graceful shutdown is only enabled when the
[respective cargo feature](/cargo-features.) is enabled. It is supported on all
platforms.

This is an optional feature because it's performance implications. An atomic
integer is accessed a few times for each connection/request. This can be avoided
when no graceful shutdown is needed.

## Process

-   When
    [`shutdown()`](https://doc.kvarn.org/kvarn/shutdown/struct.Manager.html#method.shutdown)
    is called, all listeners stop listening.
-   Once the count of active connections reach 0, the actual shutdown is
    initiated.
-   First, all clients which have called
    [`wait_for_pre_shutdown()`](https://doc.kvarn.org/kvarn/shutdown/struct.Manager.html#method.wait_for_pre_shutdown)
    are resolved. They are given a sender. When they are done shutting down,
    they send back a unit type `()`.
-   When all `wait_for_pre_shutdown` have responded, the tasks awaiting
    [`wait()`](https://doc.kvarn.org/kvarn/shutdown/struct.Manager.html#method.wait)
    are released.
-   This usually means the code which created the Kvarn server continues. This
    means all Kvarn resources are released.
-   In the reference implementation, now we've reached the end of the main
    function. The application will quit and tokio shut down.
