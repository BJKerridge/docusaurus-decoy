---
sidebar_position: 3
pagination_next: null
pagination_prev: null
title: Setting Up Mumble
description: Short Description
---

# Mumble Setup

Mumble is our VoiP for organised fleet comms and standing fleet activity. 
Mumble Authentication is secured through SeAT.
Download the Mumble release which links to our tool [here](https://github.com/mumble-voip/mumble/releases/tag/v1.4.230).

## Connecting to Mumble
1. Access [Mumble Registration](https://seat.xdecoyx.com/mumble/register) tool on SeAT
2. Enter your email address (used by Mumble for encryption, you will not recieve any confirmation or registration emails)
3. This will save a file to your Downloads folder called 'register.p12'.
4. Open Mumble and select "Configure -> Certificate Wizard"
5. Select "Import Certificate" and navigate to the 'register.p12' file generated in step 3.
6. Click Connect to Mumble with the following details:
> Address: mumble.xdecoyx.com
> Port: 64738
> Username: [your username]
> Label: DECOY

## Using Mumble
Once connected to Mumble, you will be prompted to create a 'Push to Talk' button.
This key will be known as 'Shouting'. Anybody in a connected channel (see the blue link :link: ) will be able to hear you.
It is important to setup a 'Whisper' key using the following steps:
1. Open Settings
2. Scroll to Shortcuts
3. 'Add' a new shortcut
4. Select the Function "Whisper/Shout"
5. In the 'Data' column, select the option 'Current'. 'Shout to Linked channels' and 'Shout to subchannels' must remain unselected, then press OK
6. Select your Shortcut

## FAQs - It isn't working!!
1. I get the error 'Unable to import. Missing password or incompatible file type'
  - Check you're using Mumble v1.4.230; you may need to downgrade your version. Download it [here](https://github.com/mumble-voip/mumble/releases/tag/v1.4.230) and re-install.

2. Mumble is asking me for a password
  - You haven't imported the certificate generated via SeAT