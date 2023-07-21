# [kvarn.org](https://kvarn.org/)

To get the full version running, [download the fonts](download-fonts.sh) and
start the
[Kvarn reference implementation](https://github.com/Icelk/kvarn-reference) with

```shell
$ cargo r --features high_ports
```

to run it on high ports (8080, 8443), so you don't need superuser privileges.

This is the source of [Kvarn's](https://github.com/Icelk/kvarn) website. To get
the full version running, [download the fonts](download-fonts.sh) and start the
server:

> You do have to clone [Mölla](https://github.com/Icelk/moella) to `../moella`
> to get a successful build.

```shell
# go to your cloned icelk.dev
$ cd ../icelk.dev
$ cd server
$ cargo install --path .
$ cd ..
$ kvarn-icelk -c icelk.dev.ron --high-ports -d kvarn.org
```

to run on high ports (8080, 8443), so you don't need superuser privileges.

## Contribution

Feel free to address any typos or misinformation! The only requirement is to
accept and cohere to [the license](#license).

## License

The text and logo on this website are licensed under the
[CC-BY-SA-4.0 license](https://github.com/Icelk/kvarn.org/blob/main/public/text-license.txt)
The code examples and JavaScript source code is licensed under the
[MIT license](https://github.com/Icelk/kvarn.org/blob/main/public/code-license.txt).

All contributions must be licensed accordingly.

The above is not applicable to [highlight.js](highlight.js) which is licensed
under the `BSD 3-Clause License`.
