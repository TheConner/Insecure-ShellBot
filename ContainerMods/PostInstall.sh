#!/bin/bash
cd /root
curl https://github.com/sudo-project/sudo/releases/download/SUDO_1_8_31p2/sudo_1.8.31-3_deb10_amd64.deb --output sudo.deb
dpkg -i sudo.deb