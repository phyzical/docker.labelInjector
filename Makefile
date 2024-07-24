-include .env
DIR=/usr/local/emhttp/plugins/docker.versions
SSH_HOST=${USERNAME}@${HOST}


build:
	bash pkg_build.sh
	
