# Display-Software

The software driving the display on the hitcho-mk4.
It is meant to be run on a [Raspberry Pi](https://www.raspberrypi.org/) embedded computer.

## Software Organization:


## One line installation and configuration:
Paste the following line into a terminal on the pi and everything should be installed and configured. If it doesn't work, follow the steps below. It makes backups of each file modified (`.bak`) so the original configuration can be restored using these files. 
```
sudo apt-get install git curl unclutter screen -y && curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - && sudo apt-get install nodejs build-essential -y && git clone https://github.com/hitchco-mk4/Display-Software && cd Display-Software && npm install && sudo mv /boot/config.txt /boot/config.txt.old && sudo mv config.txt /boot/config.txt && sudo python3 edit_cmdline.py && sudo mv /home/pi/.config/lxsession/LXDE-pi/autostart /home/pi/.config/lxsession/LXDE-pi/autostart.old && sudo mv autostart /home/pi/.config/lxsession/LXDE-pi/autostart && sudo mv /home/pi/.config/lxpanel/LXDE-pi/panels/panel /home/pi/.config/lxpanel/LXDE-pi/panels/panel.old && sudo mv panel /home/pi/.config/lxpanel/LXDE-pi/panels/panel && touch /home/pi/Desktop/test.desktop && rm /home/pi/Desktop/*.desktop && sudo mv /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf.old && sudo mv desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf && echo "pi:raspberry1" | sudo chpasswd && sudo mv /etc/hosts /etc/hosts.old && sudo mv hosts /etc/hosts && sudo mv /etc/hostname /etc/hostname.old && sudo mv hostname /etc/hostname &&  sudo reboot
```

This does the following:
1. Install apt packages `git`, `curl`, `unclutter` and `screen`
2. Install `node.js` version 6
3. Clone the [github repo](https://github.com/hitchco-mk4/Display-Software) and install
4. Install the correct `/boot/config.txt`
5. Install the correct `/boot/cmdline.txt`
6. Install the LXDE `autostart` script
7. Install the LXDE `panel` script
8. Remove desktop icons
9. Hide the trashcan and install the custom wallpaper
10. Set the password for the `pi` user to `raspberry1`
11. Change the hostname from `raspberrypi` to `MK4`
12. Reboot



## Prerequisites:

This software has only been verified to work on the [September 2017 version of Raspian Stretch With Desktop](https://downloads.raspberrypi.org/raspbian_latest)

Installation is based on `git`, install `git` with:

```
sudo apt-get install git
```

You also need `node.js` (and `npm`) for installation:

```
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
```

The `unclutter` package is used to hide UI elements in the OS. Install with:

```
sudo apt-get install unclutter
```

`screen` is used to run the software at boot. Install it with:

```
sudo apt-get install screen
```

## Installing

Download the package from `git` and then use `npm` to install:

```
git clone https://github.com/hitchco-mk4/Display-Software
cd Display-Software
npm install
```

`electron` needs to build `serialport` against the version of `node.js` that it (electron) ships with, but this should happen automatically.

## Configuring

The file `/boot/config.txt` on the Raspberry Pi should match the [following](./config.txt):
```
# For more options and information see
# http://rpf.io/configtxt
# Some settings may impact device functionality. See link above for details

# uncomment if you get no picture on HDMI for a default "safe" mode
#hdmi_safe=1

# uncomment this if your display has a black border of unused pixels visible
# and your display can output without overscan
#disable_overscan=1

# uncomment the following to adjust overscan. Use positive numbers if console
# goes off screen, and negative if there is too much border
#overscan_left=16
#overscan_right=16
#overscan_top=16
#overscan_bottom=16

# uncomment to force a console size. By default it will be display's size minus
# overscan.
#framebuffer_width=1280
#framebuffer_height=720

# uncomment if hdmi display is not detected and composite is being output
#hdmi_force_hotplug=1

# uncomment to force a specific HDMI mode (this will force VGA)
#hdmi_group=1
#hdmi_mode=1

# uncomment to force a HDMI mode rather than DVI. This can make audio work in
# DMT (computer monitor) modes
#hdmi_drive=2

# uncomment to increase signal to HDMI, if you have interference, blanking, or
# no display
#config_hdmi_boost=4

# uncomment for composite PAL
#sdtv_mode=2

#uncomment to overclock the arm. 700 MHz is the default.
#arm_freq=800

# Uncomment some or all of these to enable the optional hardware interfaces
#dtparam=i2c_arm=on
#dtparam=i2s=on
#dtparam=spi=on

# Uncomment this to enable the lirc-rpi module
#dtoverlay=lirc-rpi

# Additional overlays and parameters are documented /boot/overlays/README

# Enable audio (loads snd_bcm2835)
dtparam=audio=on


#CUSTOM FIELDS
lcd_rotate=2
enable_uart=1


disable_splash=1
```

The file `/boot/cmdline.txt` on the Raspberry Pi should match the following:
```
dwc_otg.lpm_enable=0 console=tty3 root=PARTUUID=8f87bb40-02 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait quiet splash loglevel=0 logo.nologo vt.global_cursor_default=0
```
Note that the line `root=PARTUUID=8f87bb40-02` should match entry in the original `/boot/cmdline.txt`.


The file `/home/pi/.config/lxsession/LXDE-pi/autostart` on the Raspberry Pi should match the [following](./autostart):
```
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@point-rpi


# Run Electron At Boot
@screen -d -m npm start --prefix /home/pi/Display-Software

# Prevents Pi Display From Sleeping
@xset s 0 0
@xset s noblank
@xset s noexpose
@xset dpms 0 0 0

# Auto-hide the mouse
@unclutter -idle 0
```

The file `/home/pi/.config/lxpanel/LXDE-pi/panels/panel` on the Raspberry Pi should match the [following](./panel):
```
# lxpanel <profile> config file. Manually editing is not recommended.
# Use preference dialog in lxpanel to adjust config when you can.

Global {
  edge=top
  allign=left
  margin=0
  widthtype=percent
  width=100
  height=36
  transparent=0
  tintcolor=#000000
  alpha=0
  autohide=1
  heightwhenhidden=0
  setdocktype=1
  setpartialstrut=1
  usefontcolor=0
  fontsize=12
  fontcolor=#ffffff
  usefontsize=0
  background=0
  backgroundfile=/usr/share/lxpanel/images/background.png
  iconsize=36
}
Plugin {
  type=launchbar
  Config {
    Button {
      id=lxterminal.desktop
    }
  }
}
```

Remove all desktop icons:
```
rm /home/pi/Desktop/*.desktop
```

The file `/home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf` on the Raspberry Pi should match the [following](./desktop-items-0.conf):
```
[*]
wallpaper_mode=crop
wallpaper_common=1
wallpaper=/home/pi/Display-Software/wallpaper.png
desktop_bg=#d6d6d3d3dede
desktop_fg=#e8e8e8e8e8e8
desktop_shadow=#d6d6d3d3dede
desktop_font=Piboto Light 12
show_wm_menu=0
sort=mtime;ascending;
show_documents=0
show_trash=0
show_mounts=0
prefs_app=SUDO_ASKPASS=/usr/bin/pwdpip.sh pipanel
```
This hides the trashcan and sets the wallpaper.

The password should be changed to `raspberry1` to avoid the warning message on the desktop. Run the following command:
```
echo "pi:raspberry1" | sudo chpasswd
```

The file `/etc/hosts` on the Raspberry Pi should match the [following](./hosts):
```
127.0.0.1	localhost
::1		localhost ip6-localhost ip6-loopback
ff02::1		ip6-allnodes
ff02::2		ip6-allrouters

127.0.1.1	MK4
```

The file `/etc/hostname` on the Raspberry Pi should match the [following](./hostname):
```
MK4
```

Finally, reboot the Raspberry Pi:
```
sudo reboot
```

## Running

### Starting from SSH Session

If you want to start Display-Software from an SSH session on a remote machine, you must first run the following command:

```
export DISPLAY=:0
```

Then when in the `/home/pi/Display-Software` directory run:

```
npm start
```

### Attaching to Running Session

By default, Display-Software runs on boot using an [autostart script](http://www.esologic.com/?p=2573) that runs `npm start` in a screen session. To get access to that screen session to stop it, or observe debug information, run the following commands:

```
screen -list
```

And a list current screen sessions running on the machine will appear. You then attach to one using:

```
screen -r yoursession
```

Example:

![screen](https://user-images.githubusercontent.com/3516293/31740022-f7f9c3ee-b41d-11e7-89c2-552485cf6b44.PNG)


### Starting from Device

If you want to start Display-Software from the device (ie. keyboard attached to pi), in the `Display-Software` directory run:
```
npm start
```