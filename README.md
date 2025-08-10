python3 odoo-bin --addons-path=addons,custom_addons -u custom_addons/pos_customer_display_fullscreen   -d mydb2

sudo apt install wmctrl xdotool x11-utils -y


sudo nano /usr/local/bin/chrome-kiosk-monitor.sh
sudo chmod +x /usr/local/bin/chrome-kiosk-monitor.sh
sudo nano /etc/systemd/system/chrome-kiosk.service



sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable chrome-kiosk.service
sudo systemctl start chrome-kiosk.service

sudo systemctl status chrome-kiosk.service

