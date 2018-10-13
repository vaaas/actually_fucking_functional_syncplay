#!/bin/sh

mpv --pause --input-ipc-server=/tmp/mpvsocket.sock "$2" &
sleep 1s
node client.js "$1"
