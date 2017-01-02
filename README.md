# InfoSec API

## Dependencies
- node > v4.2.5
- nvm > 0.30.2

### Notes
To install node in a Raspberry Pi just [download](https://nodejs.org/en/download/) the Linux Binaries for ARMv6 and extract them. You can also export the bin folder as a variable in ~/.bashrc.
```bash
export NODE_DIR="path_to_node_binaries"
PATH="$PATH:$NODE_DIR/bin"
```
But **be carefull** if you have already a node version installed it will use that one instead of the downloaded one. So if you want to use the new version uninstall the previous one or just call it using the path `$NODE_DIR/bin/node`

## Install node dependencies
```bash
$ npm install
or
$ $NODE_DIR/npm install
```

## Configuration
You can change the app port in `_conf/config.js`.

## Run
```bash
$ npm start
or
$ $NODE_DIR/bin/node index.js
```

### Trying it out
(on the local machine)
- Open `http://localhost:3001` to see the map page
- Open `http://localhost:3001/c-ops` to see the control page

(using other machines)
- Check the console in the machine running the node server when it runs it should print the ip and port
- Open the above links using the `ip` and `port` printed on the console
