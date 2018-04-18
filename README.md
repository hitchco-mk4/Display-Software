# HUD-pc

The software driving the display on the hitcho-mk4.
It is meant to be run on a [Raspberry Pi](https://www.raspberrypi.org/) embedded computer.

## Software Organization:
![Software Organization](https://user-images.githubusercontent.com/3516293/31198599-da37c550-a922-11e7-993c-caa9341039f2.png)

## Prerequisites:

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

## Installing

Download the package from git and then use NPM to install

```
git clone https://github.com/hitchco-mk4/HUD-pc
cd HUD-pc
npm install
```

Electron needs to build serialport against the version of Node it ships with, but this should happen automatically.

## Configuring

Install the custom splash screen:

```
sudo mv /usr/share/plymouth/themes/pix/splash.png /usr/share/plymouth/themes/pix/splash.png.old
sudo ln -s /home/pi/HUD-pc/media/splash-logo.png /usr/share/plymouth/themes/pix/splash.png
```

Install the custom wallpaper:

```
pcmanfm --set-wallpaper /home/pi/HUD-pc/media/starting-electron-wallpaper.png
```

The LDXE config file located at `~/.config/lxsession/LXDE-pi/autostart` should match the following [file](./autostart.txt)):

```
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@point-rpi


# Run Electron At Boot
@screen -d -m npm start --prefix /home/pi/HUD-pc

# Prevents Pi Display From Sleeping
@xset s 0 0
@xset s noblank
@xset s noexpose
@xset dpms 0 0 0

# Auto-hide the mouse
@unclutter -idle 0
```


## Running

### Starting from SSH Session

If you want to start HUD-pc from an SSH session on a remote machine, you must first run the following command:

```
export DISPLAY=:0
```

Then when in the `/home/pi/HUD-pc` directory run:

```
npm start
```

### Attaching to Running Session

By default, HUD-pc runs on boot using an [autostart script](http://www.esologic.com/?p=2573) that runs `npm start` in a screen session. To get access to that screen session to stop it, or observe debug information, run the following commands:

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

If you want to start HUD-pc from the device (ie. keyboard attached to pi), in the `HUD-pc` directory run:
```
npm start
```