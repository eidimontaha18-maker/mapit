#!/bin/bash
# Emergency server restart script
# Accessible via web trigger (placeholder - requires manual placement)

# Kill runaway processes
sudo pkill -9 npm 2>/dev/null
sudo pkill -9 node 2>/dev/null
sudo pkill -9 ssh 2>/dev/null
sudo pkill -9 bash 2>/dev/null

# Wait
sleep 2

# Restart Apache
sudo systemctl restart apache2

# Check status
echo "Server status:" > /tmp/restart.log
date >> /tmp/restart.log
uptime >> /tmp/restart.log
systemctl is-active apache2 >> /tmp/restart.log
cd /home/mapit/backend && npx pm2 list >> /tmp/restart.log
