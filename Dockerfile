FROM debian:latest

# Make sure the container is updated
RUN apt-get update && apt-get install bash screenfetch gcc curl unzip -y 
COPY ./ContainerMods/sudo.deb /root/sudo.deb
RUN dpkg -i /root/sudo.deb

# Add a new user for our pleasures
RUN useradd -ms /bin/bash shellbot

# Copy our mods
COPY ./ContainerMods/ping /bin/ping
COPY ./ContainerMods/sudoers /etc/sudoers
COPY ./ContainerMods/02-FLAG.txt /root/02-FLAG.txt

# Allow apt-get with no password
RUN echo "shellbot ALL=(root) NOPASSWD: /usr/bin/apt-get" >> /etc/sudoers

USER shellbot
WORKDIR /home/shellbot
COPY --chown=root:root ContainerFiles/* /home/shellbot/