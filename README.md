# OpenCore Updater
Update your OpenCore easily.

## Installation
This app is supported on macOS only. 

Download the latest version from [release page](https://github.com/mswgen/oc-updater/releases).

Mount the disk image and copy OpenCore Updater to /Applications.

When launching the first time, a dialog will appear saying that the app cannot be opened. This is because the app is not signed.

Press Cancel, open Finder and go to /Applications.

Right click OpenCore Updater and select "Open". Another dialog will appear saying that macOS cannot verify the developer. Press Open, and the app will open. You don't need to do this the next time. However, when updating(reinstalling) the app, you will need to do this again.

## Usage

When the app opens, press `Get Started`. A dialog will appear asking you to select the EFI directory.

Select your EFI directory. It's usually /Volumes/EFI/EFI. It should have BOOT and OC directories inside.

If your OpenCore version is recognized, your OpenCore version and list of kexts you are using will be displayed.

If your OpenCore version is not recognized, you will be asked to select the OpenCore version you are using. Select the version you are using and press `Select this version`.

If you are not using the latest version of OpenCore, the app will ask you to update. Press `Update` to update OpenCore.

The app will start to download OpenCore, kexts, and Binary Data. this might take some time and you might see the spinning beach ball.

When the app finishes downloading, it will create a backup of your old EFI and will swap files with the new ones.

Then, it will update config.plist. When it's done, it will display that it's done. It will also display the list of not updated kexts, the backup directory, and that OpenCore Vault is disabled(if it was enabled). You need to reboot your computer to see the changes.

## Troubleshooting

### When the update is done, it displays that OpenCore Vault is disabled

If you were using OpenCore Vault, this message will appear. This is because the app cannot create OpenCore Vault.

So if you want to use OpenCore Vault, you need to create vault again and enable it in the config.plist.

### My OpenCore version is not recognized

OpenCore Updater checks your OpenCore version by comparing the SHA-256 hash of your OpenCore.efi and the list of hashes in the app. If the hash is not listed in the app, it can't recognize your OpenCore version. You can just manually select the version you are using and press `Select this version`.

If you are using too old version (before 0.6.8), you need to manually update to 0.6.8 and then use this app to update to the latest version.

Also, if you are using the DEBUG build or 32-Bit version of OpenCore, you can't use the app.

### Some kexts are not updated

OpenCore Updater doesn't update all kexts, but it will update the ones that are listed in the app. The list of kexts that thid app can update is:

* VirtualSMC and plugins
* Lilu
* WhateverGreen
* AppleALC (including AppleALCU)
* VoodooPS2Controller
* VoodooI2C and satelite kexts
* ECEnabler
* BrightnessKeys
* IntelMausi
* RealtekRTL8111
* itlwm
* AirportItlwm
* IntelBluetoothFirmware
* IntelBluetoothInjector
* NVMeFix

all other kexts (including USBInjectAll, XHCI-Unsupported, VoodooRMI, etc.) will not be updated. However, there might be a newer version of those kexts. If this is the case, you should update them manually.

### Auto app update support

Unfortunately, the app cannot automatically update itself. You need to manually update the app. This is because the app is not signed. You can download the latest version from [release page](https://github.com/mswgen/oc-updater/releases) and replace the app in /Applications.

When you launch the updated version, a dialog will appear saying that the app cannot be opened. This is because the app is not signed. Please do the same thing you did when installing the app the first time.

There's no plan to sign the app.

## How to build

1. Install [Node.js](https://nodejs.org/en/download/). Version 16 (Currently LTS) is recommended.

2. Clone or download the source code.

3. Open the terminal and type: `npm i -g yarn` to install yarn.

4. Type `yarn` to install the dependencies.

5. To open the app for development, type `yarn start`.

6. Type `yarn build` to build the app. You need a Mac or Hackintosh to build the app.

7. You can find the DMG file in the `out` directory. This app can run on both Intel Mac (Including Hackintosh) and Apple Silicon Mac.

## Credits

[mswgen](https://github.com/mswgen) for the app.

[acidanthera](https://github.com/acidanthera) for the [OpenCore](https://github.com/acidanthera/OpenCorePkg) project and many kexts.

[InsanelyMac](https://insanelymac.com) for RealtekRTL8111 kext.

[1Revenger1](https://github.com/1Revenger1) for ECEnabler kext.

[OpenIntelWireless](https://github.com/OpenIntelWireless) for AirportItlwm, itlwm, and IntelBluetoothFirmware kext.

[VoodooI2C](https://github.com/VoodooI2C) for VoodooI2C and satelite kexts.

[Apple](https://apple.com) for macOS.

[junepark](https://x86.co.kr/@junepark) for testing.

[exacore39](https://x86.co.kr/@exacore39) for testing.

[JGP](https://x86.co.kr/@JGP) for testing and update guides.

And many people who contributed to the project.

## License

Copyright (c) 2021 mswgen. All rights reserved.

Licensed under the [MIT license](./LICENSE). Please see the LICENSE file for more information.

OpenCore and the OpenCore logo are trademarks of Acidanthera.

Apple and macOS are trademarks of Apple Inc. Apple is not associated with or affiliated with this project.

All other trademarks are the property of their respective owners.