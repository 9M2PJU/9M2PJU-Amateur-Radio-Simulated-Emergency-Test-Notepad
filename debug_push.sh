#!/bin/bash
echo "Starting push at $(date)" > push_log.txt
git push origin main --tags -f >> push_log.txt 2>&1
echo "Finished push with exit code $?" >> push_log.txt
