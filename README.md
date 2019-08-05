# piwol-server

This is an implementation of a Wake on Lan API server written in Node JS based on express.

## What is it?

It aims to be a small server you can keep on 24/7 on a low powered device in your Home/Small office environment, for the occasions in which you need to access remotely your main machine, but it's off.

## Development

I'm developing this project just to have an excuse to use the Raspberry Pi and to scratch the proverbial itch. I'm still learning to code, so expect buggy and messy code. If anyone wants to join in the development, you're welcome to open issues and submit pull requests to show me where I'm going totally wrong.

## How to test it

Clone this repo, install its dependencies and you should be set:

```bash
git clone https://github.com/nirebu/piwol-server.git
cd piwol-server
npm install
```

Get yourself a ristretto while it installs (right now not many dependencies) and then

```bash
npm run dev
```