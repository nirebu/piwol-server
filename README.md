# piwol-server

This is an implementation of WakeOnLan API server based on express and written in Node JS.

## Use

It aims to be a small server that you can keep turned on 24/7 in a low powered device which is in your home or a small office environment. It is used when your main machine is off, but you need to access it remotely.

## Development Process

I'm developing this project just to have an excuse to use the Raspberry Pi and to scratch the proverbial itch. I'm still learning to code, so expect buggy and messy code. If anyone wants to join in the development, you're welcome to open issues and submit pull requests to show me where I'm going wrong.

## Preparing the Raspberry Pi

Much of the work is based on the `arp` command, which is not installed by default on the Raspberry. To get it installed you need to install the `net-tools` package

```bash
sudo apt install net-tools
```

On the Raspberry PI install `nodejs` with the following command

```bash
sudo apt install nodejs npm
```

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

## To-do

- [ ] Integrate a logging middleware, perhaps `morgan`?
- [ ] Finish up the API, but first, need to build the frontend
