'''
auto_update.py

Pull from the Display-Software remote GitHub repo master branch. If there are changes there, it runs `npm install`

Should allow developer to only have to worry about putting files into git.

'''

from urllib.request import urlopen
import sys
import subprocess


def blocking_run(command):
	return str(subprocess.run(command, shell=True, stdout=subprocess.PIPE).stdout)

	
if __name__ == "__main__":

	try:
		urlopen('http://www.google.com', timeout=1)
	except urllib2.URLError as err: 
		sys.exit()

	git_directory = "/home/pi/Display-Software/"
		
	checkout_master = "git -C " + git_directory + " checkout master"
	reset = "git -C " + git_directory + " reset --hard HEAD"
	pull = "git -C " + git_directory + " pull origin master"
	
	pre_pull_commands = [checkout_master, reset]
	
	for command in pre_pull_commands:
		blocking_run(command)
		
	result = blocking_run(pull)
	
	if "Updating" in result:
		blocking_run("npm install ---prefix /home/pi/Display-Software/")
		
	