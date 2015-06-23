#!/bin/bash

# compile..
gcc -Wall temper.c pcsensor.c -o temper -lusb -lcurl

exec go-cron -s "$SCHEDULE" -p 8080 -- /bin/bash -c "./temper"

