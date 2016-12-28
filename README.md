# InfoSec API

## Dependencies
- node > v4.2.5
- nvm > 0.30.2

### Notes
To install node in a Raspberry Pi just [download](https://nodejs.org/en/download/) the Linux Binaries for ARMv6. You can also export the bin folder as a variable in ~/.bashrc.
```bash
export NODE_DIR="path_to_node_binaries"
PATH="$PATH:$NODE_DIR/bin"
```
But **be carefull** if you have already a node version installed it will use that one instead of the downloaded one.

- Install node dependencies
```bash
$ npm install
or
$ $NODE_DIR/npm install
```

- Run
```bash
$ npm start
or
$ $NODE_DIR/bin/node index.js
```
