import electron from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import cp from 'child_process';
const PID = Math.floor(Math.random() * 1000000);
const checksums = {
    '962bd270c8c2eec39b887d71b5204817e2d41349558f30d77fb91969288c0648': '0.7.4',
    '3b8f5278b4871c8c2a0efe1239d4a845acefd987381233c997c02972b10e110f': '0.7.3',
    'e515a3b404e35801ef89ed65e9109a81ff77b3d6589e9ad6cc609e3cd9347d0a': '0.7.2',
    '5984e2a40124cccce2871d755188bbd21a0cee0a3d15a2ee9e46936d5086d36f': '0.7.2',
    'b8b12c1769cb55a930207af8a3a4624cdaef1b944cc589fb2cdc58f1bd02b8a4': '0.7.1',
    'ebb13921259de09c71927b6d8705b521521a5a3c2fff0e1c28e552c2afd7bf39': '0.7.1',
    '68d7de12591bb4f851dddcb3e2058bcd1549eb574be1184d4236487a8c3f5b4b': '0.7.0',
    '12ef265cd9cd21b15533d82d2b626b77227fafa9d22a9fc75980dd04be78aed2': '0.7.0',
    '632315073fe02423f8ece95abb645e1e138c770669dbfe6f1e9eb12845f70083': '0.6.9',
    '6693c29a482c75e023831103105564fafbf539536f832fa38f74039bfb87a340': '0.6.9'
}
const updates: any = {};
for (let file of fs.readdirSync(`${__dirname}/update`).filter(x => x.endsWith('.js'))) {
    const mod = require(`./update/${file}`).default;
    if (!mod.from || (mod.configPlistChange != true && mod.configPlistChange != false) || !mod.exec) continue;
    updates[mod.from] = mod;
}
let window: electron.BrowserWindow;
function createWindow(): void {
    window = new electron.BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: `${__dirname}/preload.js`
        }
    });
    window.loadFile(path.join(__dirname, '../index.html'));
}
electron.app.whenReady().then(() => {
    createWindow();
    electron.app.on('activate', (_, hasVisibleWindows) => {
        if (!hasVisibleWindows) createWindow();
    });
    electron.app.on('window-all-closed', electron.app.quit);
});
electron.ipcMain.on('select-efi-directory', evt => {
    const dir = electron.dialog.showOpenDialogSync(window, {
        title: 'Select EFI directory',
        buttonLabel: 'Select',
        properties: ['openDirectory', 'showHiddenFiles'],
        message: 'Select the EFI directory you want to update. It should have BOOT and OC directory inside.'
    });
    if (!dir) {
        evt.returnValue = 'cancel button pressed';
        return;
    }
    evt.returnValue = dir[0];
});
electron.ipcMain.on('check-efi-validity', (evt, efidir) => {
    if (!efidir || !fs.existsSync(efidir)) {
        evt.returnValue = false;
        return;
    }
    const firstDepth = fs.readdirSync(efidir);
    if (!firstDepth.includes('BOOT') || !firstDepth.includes('OC') || !fs.existsSync(`${efidir}/BOOT/BOOTx64.efi`)) {
        if (fs.existsSync(`${efidir}/BOOT/BOOTia32.efi`)) {
            evt.returnValue = '32bit';
            return;
        }
        evt.returnValue = false;
        return;
    }
    const secondDepth = fs.readdirSync(`${efidir}/OC`);
    if (!secondDepth.includes('ACPI') || !secondDepth.includes('Drivers') || !secondDepth.includes('Kexts') || !secondDepth.includes('OpenCore.efi') || !(secondDepth.includes('config.plist') || secondDepth.includes('Config.plist')) || !secondDepth.includes('Resources') || !secondDepth.includes('Tools')) {
        evt.returnValue = false;
        return;
    }
    evt.returnValue = true;
});
electron.ipcMain.on('check-opencore-version', (evt, ocfile) => {
    const sha = crypto.createHash('sha256').update(fs.readFileSync(ocfile)).digest('hex');
    if ((checksums as any)[sha]) {
        evt.returnValue = (checksums as any)[sha];
    } else {
        evt.returnValue = 'not-found';
    }
});
electron.ipcMain.on('kextinfo', (evt, kextdir) => {
    evt.returnValue = fs.readdirSync(kextdir).filter(x => x.endsWith('.kext')).filter(x => !x.startsWith('._'));
});
electron.ipcMain.on('download-oc', evt => {
    cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o OpenCore-0.7.4-RELEASE.zip https://github.com/acidanthera/OpenCorePkg/releases/download/0.7.4/OpenCore-0.7.4-RELEASE.zip; mkdir OpenCore-0.7.4-RELEASE; cd OpenCore-0.7.4-RELEASE; unzip ../OpenCore-0.7.4-RELEASE.zip`);
    evt.returnValue = 'success';
});
electron.ipcMain.on('download-kexts', (evt, kexts) => {
    if (kexts.includes('VirtualSMC.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o VirtualSMC-1.2.7-RELEASE.zip https://github.com/acidanthera/VirtualSMC/releases/download/1.2.7/VirtualSMC-1.2.7-RELEASE.zip; mkdir VirtualSMC-1.2.7-RELEASE; cd VirtualSMC-1.2.7-RELEASE; unzip ../VirtualSMC-1.2.7-RELEASE.zip`);
    }
    if (kexts.includes('Lilu.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o Lilu-1.5.6-RELEASE.zip https://github.com/acidanthera/Lilu/releases/download/1.5.6/Lilu-1.5.6-RELEASE.zip; mkdir Lilu-1.5.6-RELEASE; cd Lilu-1.5.6-RELEASE; unzip ../Lilu-1.5.6-RELEASE.zip`);
    }
    if (kexts.includes('WhateverGreen.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o WhateverGreen-1.5.4-RELEASE.zip https://github.com/acidanthera/WhateverGreen/releases/download/1.5.4/WhateverGreen-1.5.4-RELEASE.zip; mkdir WhateverGreen-1.5.4-RELEASE; cd WhateverGreen-1.5.4-RELEASE; unzip ../WhateverGreen-1.5.4-RELEASE.zip`);
    }
    if (kexts.includes('AppleALC.kext') || kexts.includes('AppleALCU.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o AppleALC-1.6.5-RELEASE.zip https://github.com/acidanthera/AppleALC/releases/download/1.6.5/AppleALC-1.6.5-RELEASE.zip; mkdir AppleALC-1.6.5-RELEASE; cd AppleALC-1.6.5-RELEASE; unzip ../AppleALC-1.6.5-RELEASE.zip`);
    }
    if (kexts.includes('VoodooPS2Controller.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o VoodooPS2Controller-2.2.6-RELEASE.zip https://github.com/acidanthera/VoodooPS2/releases/download/2.2.6/VoodooPS2Controller-2.2.6-RELEASE.zip; mkdir VoodooPS2Controller-2.2.6-RELEASE; cd VoodooPS2Controller-2.2.6-RELEASE; unzip ../VoodooPS2Controller-2.2.6-RELEASE.zip`);
    }
    if (kexts.includes('VoodooI2C.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o VoodooI2C-2.6.5.zip https://github.com/VoodooI2C/VoodooI2C/releases/download/2.6.5/VoodooI2C-2.6.5.zip; mkdir VoodooI2C-2.6.5; cd VoodooI2C-2.6.5; unzip ../VoodooI2C-2.6.5.zip`);
    }
    if (kexts.includes('ECEnabler.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o ECEnabler-1.0.2-RELEASE.zip https://github.com/1Revenger1/ECEnabler/releases/download/1.0.2/ECEnabler-1.0.2-RELEASE.zip; mkdir ECEnabler-1.0.2-RELEASE; cd ECEnabler-1.0.2-RELEASE; unzip ../ECEnabler-1.0.2-RELEASE.zip`);
    }
    if (kexts.includes('BrightnessKeys.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o BrightnessKeys-1.0.2-RELEASE.zip https://github.com/acidanthera/BrightnessKeys/releases/download/1.0.2/BrightnessKeys-1.0.2-RELEASE.zip; mkdir BrightnessKeys-1.0.2-RELEASE; cd BrightnessKeys-1.0.2-RELEASE; unzip ../BrightnessKeys-1.0.2-RELEASE.zip`);
    }
    if (kexts.includes('RealtekRTL8111.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o RealtekRTL8111-V2.4.2.zip https://github.com/Mieze/RTL8111_driver_for_OS_X/releases/download/2.4.2/RealtekRTL8111-V2.4.2.zip; mkdir RealtekRTL8111-V2.4.2; cd RealtekRTL8111-V2.4.2; unzip ../RealtekRTL8111-V2.4.2.zip`);
    }
    if (kexts.includes('IntelMausi.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o IntelMausi-1.0.7-RELEASE.zip https://github.com/acidanthera/IntelMausi/releases/download/1.0.7/IntelMausi-1.0.7-RELEASE.zip; mkdir IntelMausi-1.0.7-RELEASE; cd IntelMausi-1.0.7-RELEASE; unzip ../IntelMausi-1.0.7-RELEASE.zip`);
    }
    if (kexts.includes('NVMeFix.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o NVMeFix-1.0.9-RELEASE.zip https://github.com/acidanthera/NVMeFix/releases/download/1.0.9/NVMeFix-1.0.9-RELEASE.zip; mkdir NVMeFix-1.0.9-RELEASE; cd NVMeFix-1.0.9-RELEASE; unzip ../NVMeFix-1.0.9-RELEASE.zip`);
    }
    if (kexts.includes('itlwm.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o itlwm-2.0.0.zip https://github.com/OpenIntelWireless/itlwm/releases/download/v2.0.0/itlwm_v2.0.0_stable.kext.zip; mkdir itlwm-2.0.0; cd itlwm-2.0.0; unzip ../itlwm-2.0.0.zip`);
    }
    if (kexts.includes('AirportItlwm.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o AirportItlwm-2.0.0.zip https://github.com/OpenIntelWireless/itlwm/releases/download/v2.0.0/AirportItlwm_v2.0.0_stable_${os.release().startsWith('21.') ? 'Monterey' : (os.release().startsWith('20.') ? 'BigSur' : (os.release().startsWith('19.') ? 'Catalina' : (os.release().startsWith('18.') ? 'Mojave' : 'HighSierra')))}.kext.zip; mkdir AirportItlwm-2.0.0; cd AirportItlwm-2.0.0; unzip ../AirportItlwm-2.0.0.zip`);
    }
    if (kexts.includes('IntelBluetoothFirmware.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o IntelBluetoothFirmware-2.0.1.zip https://github.com/OpenIntelWireless/IntelBluetoothFirmware/releases/download/v2.0.1/IntelBluetoothFirmware-v2.0.1.zip; mkdir IntelBluetoothFirmware-2.0.1; cd IntelBluetoothFirmware-2.0.1; unzip ../IntelBluetoothFirmware-2.0.1.zip`);
    }
    evt.returnValue = 'success';
});
electron.ipcMain.on('download-bindata', evt => {
    cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o OcBinaryData-master.zip https://github.com/acidanthera/OcBinaryData/archive/refs/heads/master.zip; mkdir OcBinaryData-master; cd OcBinaryData-master; unzip ../OcBinaryData-master.zip`);
    evt.returnValue = 'success';
});
electron.ipcMain.on('create-backup', (evt, dir) => {
    cp.execSync(`mkdir -p "${os.homedir()}/EFI-${PID}"; cp -r "${dir}" "${os.homedir()}/EFI-${PID}"`);
    evt.returnValue = 'success';
});
electron.ipcMain.on('swap-files', (evt, dir, kexts) => {
    fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.4-RELEASE/X64/EFI/BOOT/BOOTx64.efi`, `${dir}/BOOT/BOOTx64.efi`);
    fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.4-RELEASE/X64/EFI/OC/OpenCore.efi`, `${dir}/OC/OpenCore.efi`);
    for (let driver of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.4-RELEASE/X64/EFI/OC/Drivers`)) {
        if (fs.existsSync(`${dir}/OC/Drivers/${driver}`)) {
            fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.4-RELEASE/X64/EFI/OC/Drivers/${driver}`, `${dir}/OC/Drivers/${driver}`);
        }
    }
    for (let tool of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.4-RELEASE/X64/EFI/OC/Tools`)) {
        if (fs.existsSync(`${dir}/OC/Tools/${tool}`)) {
            fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.4-RELEASE/X64/EFI/OC/Tools/${tool}`, `${dir}/OC/Tools/${tool}`);
        }
    }
    for (let driver of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Drivers`)) {
        if (fs.existsSync(`${dir}/OC/Drivers/${driver}`)) {
            fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Drivers/${driver}`, `${dir}/OC/Drivers/${driver}`);
        }
    }
    cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Resources" "${dir}/OC"`);
    if (kexts.includes('VirtualSMC.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.7-RELEASE/Kexts/VirtualSMC.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCProcessor.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.7-RELEASE/Kexts/SMCProcessor.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCSuperIO.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.7-RELEASE/Kexts/SMCSuperIO.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCBatteryManager.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.7-RELEASE/Kexts/SMCBatteryManager.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCLightSensor.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.7-RELEASE/Kexts/SMCLightSensor.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCDellSensors.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.7-RELEASE/Kexts/SMCDellSensors.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('Lilu.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/Lilu-1.5.6-RELEASE/Lilu.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('WhateverGreen.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/WhateverGreen-1.5.4-RELEASE/WhateverGreen.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('AppleALC.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AppleALC-1.6.5-RELEASE/AppleALC.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('AppleALCU.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AppleALC-1.6.5-RELEASE/AppleALCU.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooPS2Controller.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooPS2Controller-2.2.6-RELEASE/VoodooPS2Controller.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooI2C.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooI2C-2.6.5/VoodooI2C.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooI2CHID.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooI2C-2.6.5/VoodooI2CHID.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooI2CSynaptics.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooI2C-2.6.5/VoodooI2CSynaptics.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooI2CELAN.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooI2C-2.6.5/VoodooI2CELAN.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooI2CFTE.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooI2C-2.6.5/VoodooI2CFTE.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooI2CAtmelMXT.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooI2C-2.6.5/VoodooI2CAtmelMXT.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('ECEnabler.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/ECEnabler-1.0.2-RELEASE/ECEnabler.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrightnessKeys.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrightnessKeys-1.0.2-RELEASE/BrightnessKeys.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('RealtekRTL8111.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/RealtekRTL8111-V2.4.2/RealtekRTL8111-V2.4.2/Release/RealtekRTL8111.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('IntelMausi.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/IntelMausi-1.0.7-RELEASE/IntelMausi.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('NVMeFix.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/NVMeFix-1.0.9-RELEASE/NVMeFix.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('itlwm.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/itlwm-2.0.0/itlwm.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('AirportItlwm.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AirportItlwm-2.0.0/AirportItlwm.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('IntelBluetoothFirmware.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware-2.0.1/IntelBluetoothFirmware-v2.0.1/IntelBluetoothFirmware.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('IntelBluetoothInjector.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware-2.0.1/IntelBluetoothFirmware-v2.0.1/IntelBluetoothInjector.kext" "${dir}/OC/Kexts"`);
    }
    evt.returnValue = 'success'
});
electron.ipcMain.on('update-config-plist', (evt, efidir, ocver) => {
    while (true) {
        if (ocver == 74) break;
        console.log(updates[ocver.toString()]);
        if (updates[ocver.toString()].configPlistChange) {
            if (fs.readdirSync(`${efidir}/OC`).includes('config.plist')) {
                updates[ocver.toString()].exec(`${efidir}/OC/config.plist`);
            } else if (fs.readdirSync(`${efidir}/OC`).includes('Config.plist')) {
                updates[ocver.toString()].exec(`${efidir}/OC/Config.plist`);
            }
        }
        ocver++;
    }
    evt.returnValue = 'success'
});
electron.ipcMain.on('finish', evt => {
    cp.execSync(`rm -rf ${os.homedir()}/.oc-update/${PID}`);
    evt.returnValue = `${os.homedir()}/EFI-${PID}`
});