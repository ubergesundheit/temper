#!/bin/bash

while [ 1 ]
do
    sudo ./temper >> temperature.log
    sleep 5s
done
