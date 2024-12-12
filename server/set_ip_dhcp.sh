#!/bin/bash

# Set IP address in Ethernet
sudo ifconfig eth0 192.168.0.1 netmask 255.255.255.0 up

# Run DHCP server
cat <<EOF > /etc/dhcp/dhcpd.conf
subnet 192.168.0.0 netmask 255.255.255.0 {
  range 192.168.0.10 192.168.0.100;
  option routers 192.168.0.1;
}
EOF

sudo systemctl restart isc-dhcp-server