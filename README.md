_This repo is a part of the Hitchco MK4 project. You can read more about the project [here](http://www.esologic.com/hitchco-mk4/)._

# Display-Software

The software driving the display on the hitcho-mk4.
It is meant to be run on a [Raspberry Pi](https://www.raspberrypi.org/) embedded computer.

## Software Organization:

![software data flow](https://user-images.githubusercontent.com/3516293/39070220-7587746e-44b0-11e8-97f2-8d20e8ba16bc.png)

## Quick installation and configuration:

You will need to update the Raspberry Pi's Firmware first. This software is all confirmed to work on `Linux raspberrypi 4.14.37-v7+ #1111 SMP Thu Apr 26 13:56:59 BST 2018 armv7l GNU/Linux` which has a serial port fix:

```
sudo rpi-update && sudo reboot
```

Paste the following line into a terminal on the pi and everything should be installed and configured. If it doesn't work, follow the steps below.

```
sudo apt-get update -y && sudo apt-get install git curl unclutter mplayer screen xdotool -y && curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - && sudo apt-get install nodejs build-essential -y && git clone https://github.com/hitchco-mk4/Display-Software && cd Display-Software && npm install && sudo python3 edit_cmdline.py && sudo mv /boot/config.txt /boot/config.txt.old && sudo mv config.txt /boot/config.txt && sudo mv /home/pi/.config/lxsession/LXDE-pi/autostart /home/pi/.config/lxsession/LXDE-pi/autostart.old && sudo mv autostart /home/pi/.config/lxsession/LXDE-pi/autostart && sudo mv panel /home/pi/.config/lxpanel/LXDE-pi/panels/panel && sudo touch /home/pi/Desktop/test.desktop && sudo rm /home/pi/Desktop/*.desktop && sudo mv /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf.old && sudo mv desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf && sudo mv /home/pi/.config/openbox/lxde-pi-rc.xml /home/pi/.config/openbox/lxde-pi-rc.xml.old && sudo mv lxde-pi-rc.xml /home/pi/.config/openbox/lxde-pi-rc.xml && echo "pi:raspberry1" | sudo chpasswd && sudo reboot
```

This does the following:

1. **Update** `sudo apt-get update -y`
2. **Install apt packages `git`, `curl`, `unclutter`, `screen`, `mplayer` and xdotool**			`sudo apt-get install git curl unclutter mplayer screen xdotool -y`
3. **Install `node.js` version 6**																`curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - && sudo apt-get install nodejs build-essential -y`
4. **Clone the [github repo](https://github.com/hitchco-mk4/Display-Software) and install**		`git clone https://github.com/hitchco-mk4/Display-Software && cd Display-Software && npm install`
5. **Make changes to `/boot/cmdline.txt` using the `edit_cmdline.py` utility**					`sudo python3 edit_cmdline.py`
6. **Install the correct `/boot/config.txt`**													`sudo mv /boot/config.txt /boot/config.txt.old && sudo mv config.txt /boot/config.txt`
7. **Install the LXDE `autostart` script**														`sudo mv /home/pi/.config/lxsession/LXDE-pi/autostart /home/pi/.config/lxsession/LXDE-pi/autostart.old && sudo mv autostart /home/pi/.config/lxsession/LXDE-pi/autostart` 
8. **Install the LXDE `panel`, this file isn't backed up**										`sudo mv panel /home/pi/.config/lxpanel/LXDE-pi/panels/panel`
9. **Remove desktop icons**																		`sudo touch /home/pi/Desktop/test.desktop && sudo rm /home/pi/Desktop/*.desktop`
10. **Install the correct `lxde-pi-rc.xml` to display the backup camera correctly**				`sudo mv /home/pi/.config/openbox/lxde-pi-rc.xml /home/pi/.config/openbox/lxde-pi-rc.xml.old && sudo mv lxde-pi-rc.xml /home/pi/.config/openbox/lxde-pi-rc.xml`
11. **Hide the trashcan by setting the desktop items file**										`sudo mv /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf.old && sudo mv desktop-items-0.conf /home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf`
12. **Set the password for the `pi` user to `raspberry1`**										`echo "pi:raspberry1" | sudo chpasswd`
13. **Reboot**																					`sudo reboot`

## Manual Installation
### Prerequisites:

This software has only been verified to work on the [September 2017 version of Raspian Stretch With Desktop](https://downloads.raspberrypi.org/raspbian_latest)

Installation is based on git, install git with:
```
sudo apt-get install git
```

You also need Node (and npm) for installation:
```
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
```

The Unclutter package is used to hide UI elements from the os. Install with:
```
sudo apt-get install unclutter
```

MPlayer is used to view the backup camera. Install it with:
```
sudo apt-get mplayer
```

### Installing `node.js` software:

Download the package from git and then use NPM to install
```
git clone https://github.com/hitchco-mk4/Display-Software
cd Display-Software
npm install
```
Electron needs to build serialport against the version of Node it ships with, but this should happen automatically.

### Configuring

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

Run `edit_cmdline.py` as root on the Raspberry Pi to automatically configure `/boot/cmdline.txt`:
```
sudo python3 edit_cmdline.py
```


The file `/home/pi/.config/lxsession/LXDE-pi/autostart` on the Raspberry Pi should match the [following](./autostart):
```
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash

# Automatically pull from the master branch of github on boot
@python3 /home/pi/Display-Software/auto_update.py

# Run Electron At Boot
@screen -d -m npm start --prefix /home/pi/Display-Software

# Prevents Pi Display From Sleeping
@xset s 0 0
@xset s noblank
@xset s noexpose
@xset dpms 0 0 0

# Hide the mouse unless moved
@unclutter -idle 0.1
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
  backgroundfile=/home/pi/Display-Software/wallpaper.png
  iconsize=36
}
Plugin {
  type=menu
  Config {
    image=/usr/share/raspberrypi-artwork/launch.png
    system {
    }
    separator {
    }
    item {
      name=Run...
      image=system-run
      command=run
    }
    separator {
    }
    item {
      name=Shutdown...
      image=system-shutdown
      command=logout
    }
  }
}
Plugin {
  type=launchbar
  Config {
    Button {
      id=lxterminal.desktop
    }
  }
}
Plugin {
  type=dhcpcdui
  Config {
  }
}
```

Remove all desktop icons:
```
touch /home/pi/Desktop/tmp.desktop && rm /home/pi/Desktop/*.desktop
```

The file `/home/pi/.config/pcmanfm/LXDE-pi/desktop-items-0.conf` on the Raspberry Pi should match the [following](./desktop-items-0.conf):
```
[*]
wallpaper_mode=crop
wallpaper_common=1
wallpaper=/home/pi/Display-Software/media/wallpaper.png
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
This hides the trashcan, and finishes installing the custom wallpaper.

The password should be changed to `raspberry1` to avoid the warning message on the desktop. Run the following command:
```
echo "pi:raspberry1" | sudo chpasswd
```

The file [`mplayer.settings`](./mplayer.settings) is automatically included in installation. It is used to set the `v4l2-ctl` driver for the webcam. It should match the following (**YOU DON'T HAVE TO EDIT THIS**):
```
run "v4l2-ctl --set-ctrl brightness=70"
run "v4l2-ctl --set-ctrl contrast=16"
run "v4l2-ctl --set-ctrl saturation=29"
```

The file `/home/pi/.config/openbox/lxde-pi-rc.xml` should have the following block inserted inside of the `<applications>` tags:
```
<application name="x11" class="MPlayer">
<decor>no</decor>
<position force="yes">
<x>center</x>
<y>center</y>
</position>
</application>
```

The full file should match [this](./lxde-pi-rc.xml) file.

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

## Backup Camera

The backup camera is a complex part of this system and is worth a little bit of extra explanation.

If you want to open the webcam window, use the following command in the `Display-Software` directory: 

```
mplayer -vf mirror -xy 350 -input file=/home/pi/Display-Software/mplayer.settings  tv://device=/dev/video0:width=300:height=220
```

The window should appear boarderless and windowless as set by `lxde-pi-rc.xml`. 

To minimize it, run
```
xdotool windowminimize $(xdotool search --class "mplayer")
```

To maximize (un-minimize) it, run:
```
xdotool windowactivate $(xdotool search --class "mplayer")
```

