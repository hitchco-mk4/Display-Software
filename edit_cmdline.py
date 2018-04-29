"""
edit_cmdline.py

This is a simple script to modify `/boot/cmdline.txt` on the Raspberry Pi to do the following:

* Makes a backup of the original file		- If there are problems, roll back to this file
* Swap `console=tty1` w/ `console=tty3`		- This re-directs kernel messages to tty3, so they won't be displayed on the screen
* Remove `console=serial0,115200`			- Disable the hardware serial port for login
* Remove `plymouth.ignore-serial-consoles`	- This will hide the welcome image
* Add `loglevel=0`							- This hides all messages from the boot screen
* Add `logo.nologo`							- This removes the Raspberry Pi's from the kernel boot menu
* Add `vt.global_cursor_default=0`			- This hides the blinking cursor in the kernel boot
* Add `vt.cur_default=1`					- This hides the blinking cursor in the OS boot
* Add `splash`								- This hides the welcome to the os image


This entry must be read in and inserted into the new configuration
"""

import sys
import os
import shutil

if __name__ == "__main__":

	remove_entries = ["plymouth.ignore-serial-consoles"]  # if these entries are found, they will be removed
	remove_startswith = ["console=tty", "console=serial0"]  # if an entry starts with this pattern, it will be removed
	add_entries = ["loglevel=0", "logo.nologo", "console=tty3", "vt.global_cursor_default=0", "vt.cur_default=1", "splash"]  # these entries will be added

	try:
		path = sys.argv[1]
	except IndexError:
		path = "/boot/cmdline.txt"
	
	# create the backup of the file
	backup_path = path + ".old"
	shutil.copyfile(path, backup_path)
	print("Backup of [" + str(path) + "] created at [" + str(backup_path) + "]")
	
	try:
		with open(path, 'r') as file:
			line = file.read()
	except IOError:
		print("File [" + str(path) + "] Not Found! Exiting")
		sys.exit()
	
	original_entries = line.rstrip().split(" ")
	
	to_be_removed = []
	
	for original_entry in original_entries:
		
		original_entry = str(original_entry)
	
		remove_entry = False
	
		if original_entry in remove_entries:
			remove_entry = True
		
		for start in remove_startswith:
			if original_entry.startswith(start):
				remove_entry = True
		
		if remove_entry:
			to_be_removed.append(original_entry)
	
	for remove_entry in to_be_removed:
		print("Removing [" + str(remove_entry) + "]")
		original_entries.remove(remove_entry)
	
	for add_entry in add_entries:
		if add_entry not in original_entries:
			original_entries.append(add_entry)
			print("Adding [" + str(add_entry) + "]")
	
	new_line = ""	
	
	for entry in original_entries:
		new_line += entry + " "
	
	new_line = new_line[:-1] # remove the trailing space
	new_line += os.linesep # add the newline at the end
	
	try:
		with open(path, 'w+') as file:
			file.write(new_line)
	except IOError:
		print("File [" + str(path) + "] Not Found! Exiting")
		sys.exit()
		
	print("Line [" + str(new_line) + "] written to [" + str(path) + "]")