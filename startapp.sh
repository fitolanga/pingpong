#!/bin/bash
WORKINGDIR="/tmp"
LOG_FILENAME=$WORKINGDIR/LOGS/$(date +\%Y-\%m-\%dT\%H-\%M-\%S)
cd $WORKINGDIR  && forever start -c node --trace-warnings -l $LOG_FILENAME.log -o $LOG_FILENAME.out.log -e $LOG_FILENAME.err.log --minUptime 1000 --spinSleepTime 1000 bot.js

# forever list  -> forever stop []