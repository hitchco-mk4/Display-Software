"""
edit_cmdline.py

This is a simple script to modify `/boot/cmdline.txt` on Raspberry Pis.

Within `/boot/cmdline.txt`, the `root=` may be different depending on how the SD card was formatted so you can't just copy paste the whole file from one to another. 

This entry must be read in and inserted into the new configuration
"""

import sys
import shutil

if __name__ == "__main__":

	path = "/boot/cmdline.txt"
	
	try:
		with open(path, 'r') as file:
			line = file.read()
	except IOError:
		print("File [" + str(path) + "] Not Found! Exiting")
		sys.exit()
	
	entries = line.split(" ")
	
	root_entry = False
	
	for entry in entries:
		if entry.startswith("root"):
			root_entry = entry
			entries.remove(entry)
			break
			
	if root_entry == False:
		print("Root entry not found! Exiting.")
		sys.exit()
				
	print("Existing Root Entry [" + str(root_entry) + "]")
	
	backup_path = path + ".old"
	
	shutil.copyfile(path, backup_path)
	
	print("Backup of [" + str(path) + "] created at [" + str(backup_path) + "]")

	new_entries = [
		"dwc_otg.lpm_enable=0",
		"console=tty3",
		"rootfstype=ext4",
		"elevator=deadline",
		"fsck.repair=yes",
		"rootwait",
		"quiet",
		"splash",
		"loglevel=0",
		"logo.nologo",
		"vt.global_cursor_default=0",
		root_entry
	]
	
	new_line = ""
	
	for entry in new_entries:
		new_line += entry + " "
		
	new_line = new_line[:-1]
	
	try:
		with open(path, 'w+') as file:
			file.write(new_line)
	except IOError:
		print("File [" + str(path) + "] Not Found! Exiting")
		sys.exit()
		
	print("Line [" + str(new_line) + "] written to [" + str(path) + "]")