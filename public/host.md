!> hide
<head>
    <title>Virtual hosts | Kvarn</title>
    <meta name="permalinks" content="not-titles"> <!-- part of JS on icelk.dev & kvarn.org, options: disabled|enabled|not-titles -->
    <meta name="description" content="Host management and virtual hosts for serving multiple domains using the Kvarn web server">
</head>

Kvarn provides a few web server primitives:

- [Host](https://doc.kvarn.org/kvarn/host/struct.Host.)s: can be thought of representing a *domain*.
    Using hosts have some advantages, namely the ability to serve the same content from several domains and over several protocols (i.e. using both HTTP and HTTPS).
- [PortDescriptor](https://doc.kvarn.org/kvarn/struct.PortDescriptor.): the settings of how to bind a port, and the associated *Hosts* to serve.
    Binding to several ports for each *Host* is useful when serving multiple protocols (HTTP over port 80 and HTTPS over port 443).
    These can be combined in the [`RunConfig`](https://doc.kvarn.org/kvarn/struct.RunConfig.).
- [Server instance](https://doc.kvarn.org/kvarn/struct.RunConfig.): an instance of a web server.

---

Combining these means you can meet complex requirements, using minimal resources (all everything is ran on one process).

Example: You're running 3 websites, with both HTTP & HTTPS. You also have a mail server using [Postfix Admin](https://postfixadmin.sourceforge.io/), so you need to serve the PHP site.
You set up 4 hosts, one for each website and 1 for the [PHP](https://doc.kvarn.org/kvarn_extensions/php/fn.mount_php.) Postfix Admin.
Then, you add the 3 website hosts to a [`HostCollection`](https://doc.kvarn.org/kvarn/host/struct.Collection.) and bind them to the standard
[HTTP](https://doc.kvarn.org/kvarn/struct.PortDescriptor.#method.http) and [HTTPS](https://doc.kvarn.org/kvarn/struct.PortDescriptor.#method.https) posts.
After some port forwarding and a domain name, these will be accessible on the internet.
You create a `HostCollection` with the PHP host and bind that to the port `8080` using the [`PortDescriptor::unsecure`](https://doc.kvarn.org/kvarn/struct.PortDescriptor.#method.unsecure).

The three public websites operate intependently with their own extensions and Postfix Admin is only accessible to the local network (assuming you didn't port forward port `8080`).
