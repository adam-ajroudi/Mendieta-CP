#!/bin/bash

# Wait for network connection
sleep 10

# Get IP address assigned by DHCP server
IP=$(grep -oP '192.168.0.\d+' /var/lib/dhcp/dhcpd.leases | tail -1)

# SSH into the machine and start the server
ssh -o StrictHostKeyChecking=no gira@$IP <<EOF
# Enter username and password for SSH access
echo "Enter username: "
read USERNAME
echo "Enter password: "
read -s PASSWORD

# Navigate to the directory and start the server
cd /home/gira/Mendieta-SW-main/server
npm run start
EOF