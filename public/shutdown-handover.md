!> hide

<head>
    <title>Graceful shutdown & handover | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Kvarn's handling of upgrades to the server and graceful shutdown.">
</head>

Graceful shutdown works by closing the listening socket and completing any connections.

Handover means the control over a port is handed over from one Kvarn instance to another. This is achieved through multiple processes binding the same port, and the old instance then quitting. When both instances are listening, the incoming request are split between them.

This is only available on Unix, see the [Tokio docs](https://docs.rs/tokio/latest/tokio/net/struct.TcpSocket.html#method.set_reuseport).

# Process

When you restart the Kvarn server,

-   first, the new binary is started. Multiple Kvarn instances can bind to the same port, ensuring 0 downtime.
-   Then, The old binary closes it's listeners and instructs all open connections to end if a transaction is not in progress.
-   Any transactions (primarily WebSockets) in progress are waited on, while the new binary accepts new requests.
-   When all transactions are closed, the old binary silently exits.
    This means if there are any alive connections, Kvarn waits for them to reconnect to the new server.

The communication between binaries are via Unix sockets (which isn't a problem as binding to the same port isn't supported on Windows).
