#!/bin/bash

output=`/srv/temper/temper`

echo -e "use temps\ndb.temps.insert($output)" | mongo
