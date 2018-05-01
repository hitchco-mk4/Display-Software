'''
auto_update.py



'''

from urllib.request import urlopen
import sys
import subprocess


def blocking_run(command):
	return subprocess.run(command, shell=True, stdout=subprocess.PIPE).stdout

	
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
	
	print(result)
		
	