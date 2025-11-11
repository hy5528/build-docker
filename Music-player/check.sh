#!/bin/bash

name="node"

while true
do
    count=`ps -ef | grep $name | grep -v "grep" | wc -l`
    if [[ $count == 0 ]];then
        echo "process not exist"
        node app.js &
    else
        echo "process exist"
    fi
    sleep 30
done
