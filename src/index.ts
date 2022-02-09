import electron, { app } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import cp from 'child_process';
import plist from 'plist';
import { autoUpdater } from 'electron-updater';
const PID = Math.floor(Math.random() * 1000000);
const checksums = {
    'a2db0a0ca004be20a3a6347367a1cf9bf2b3c383c1927e0b5bf9aee88c19da20': '0.7.8',
    'b8f1408556f338b9af478e92df494c7400149fd24c4148928fcbef0cc8b7f991': '0.7.8',
    '66c298f39508308dd97fa9fc03c1244f9818ff01170fdd798b697c8fcb20c2e2': '0.7.7',
    '032e1631b5729edfeab02998550d432ec5bbfc5c3715b8c81c7d386415f1ff7e': '0.7.6',
    'fb65a4c2af86b4209f10cadf9345947ec1d897f3c00b94eda6aa8649539a0357': '0.7.5',
    '8488c9aa2b2e7e71a4673c9601b7e2f78096bdc44e9db72be726fb673385376a': '0.7.5',
    '962bd270c8c2eec39b887d71b5204817e2d41349558f30d77fb91969288c0648': '0.7.4',
    '3b8f5278b4871c8c2a0efe1239d4a845acefd987381233c997c02972b10e110f': '0.7.3',
    'e515a3b404e35801ef89ed65e9109a81ff77b3d6589e9ad6cc609e3cd9347d0a': '0.7.2',
    '5984e2a40124cccce2871d755188bbd21a0cee0a3d15a2ee9e46936d5086d36f': '0.7.2',
    'b8b12c1769cb55a930207af8a3a4624cdaef1b944cc589fb2cdc58f1bd02b8a4': '0.7.1',
    'ebb13921259de09c71927b6d8705b521521a5a3c2fff0e1c28e552c2afd7bf39': '0.7.1',
    '68d7de12591bb4f851dddcb3e2058bcd1549eb574be1184d4236487a8c3f5b4b': '0.7.0',
    '12ef265cd9cd21b15533d82d2b626b77227fafa9d22a9fc75980dd04be78aed2': '0.7.0',
    '632315073fe02423f8ece95abb645e1e138c770669dbfe6f1e9eb12845f70083': '0.6.9',
    '6693c29a482c75e023831103105564fafbf539536f832fa38f74039bfb87a340': '0.6.9',
    'aafb2a0ce07c2b783661c82bcc99cb6d951b6584fbc05d0ca689baedf49e2ea6': '0.6.8',
    'e9bb917abdfb8d33ae11c07527e7ce53449eb71c418163bf1f375434b4f1aa07': '0.6.7',
    '2d9ce668c930c5a601024f2b4d4f6cfcbff14b9c52b2e717192fc02752922807': '0.6.7',
    'e7125f54c4a59d01bbb35d9dfb84fc310c0f7a954adf6e41f021827fab382606': '0.6.6',
    '56d29f797c2de69720dd60d495c1541bf1ddc226973a65b48540f753c412d46d': '0.6.5',
    '4c7782012375abd7a041dfa80d6ca00a8a281f09df11498efbbf1bc544604331': '0.6.4',
    '5c0f302dd84548996182940322e0acbebb6d88d8ae6d8afaba0ac2599ad0384e': '0.6.3',
    'dc2381c5ab49ac79ed6be75f9867c5933e6f1e88cb4e860359967fc5ee4916e3': '0.6.3'
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
    window.loadFile(path.join(__dirname, app.getLocale() == 'ko' ? '../index-korean.html' : '../index.html'));
}
app.commandLine.appendSwitch('disable-http2');
autoUpdater.requestHeaders = { 'Cache-Control' : 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' };
autoUpdater.checkForUpdatesAndNotify();
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
        buttonLabel: app.getLocale() == 'ko' ? '선택하기' : 'Select',
        properties: ['openDirectory', 'showHiddenFiles'],
        message: app.getLocale() == 'ko' ? '업데이트할 EFI 디렉토리를 선택해주세요. 디렉토리 바로 아래에 BOOT와 OC 디렉토리가 있어야 해요.' : 'Select EFI directory to update. Directory should contain BOOT and OC directories.'
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
    cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o OpenCore-0.7.8-RELEASE.zip https://github.com/acidanthera/OpenCorePkg/releases/download/0.7.8/OpenCore-0.7.8-RELEASE.zip; mkdir OpenCore-0.7.8-RELEASE; cd OpenCore-0.7.8-RELEASE; unzip ../OpenCore-0.7.8-RELEASE.zip`);
    evt.returnValue = 'success';
});
electron.ipcMain.on('download-kexts', (evt, kexts) => {
    if (kexts.includes('VirtualSMC.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o VirtualSMC-1.2.8-RELEASE.zip https://github.com/acidanthera/VirtualSMC/releases/download/1.2.8/VirtualSMC-1.2.8-RELEASE.zip; mkdir VirtualSMC-1.2.8-RELEASE; cd VirtualSMC-1.2.8-RELEASE; unzip ../VirtualSMC-1.2.8-RELEASE.zip`);
    }
    if (kexts.includes('Lilu.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o Lilu-1.6.0-RELEASE.zip https://github.com/acidanthera/Lilu/releases/download/1.6.0/Lilu-1.6.0-RELEASE.zip; mkdir Lilu-1.6.0-RELEASE; cd Lilu-1.6.0-RELEASE; unzip ../Lilu-1.6.0-RELEASE.zip`);
    }
    if (kexts.includes('WhateverGreen.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o WhateverGreen-1.5.7-RELEASE.zip https://github.com/acidanthera/WhateverGreen/releases/download/1.5.7/WhateverGreen-1.5.7-RELEASE.zip; mkdir WhateverGreen-1.5.7-RELEASE; cd WhateverGreen-1.5.7-RELEASE; unzip ../WhateverGreen-1.5.7-RELEASE.zip`);
    }
    if (kexts.includes('AppleALC.kext') || kexts.includes('AppleALCU.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o AppleALC-1.6.9-RELEASE.zip https://github.com/acidanthera/AppleALC/releases/download/1.6.9/AppleALC-1.6.9-RELEASE.zip; mkdir AppleALC-1.6.9-RELEASE; cd AppleALC-1.6.9-RELEASE; unzip ../AppleALC-1.6.9-RELEASE.zip`);
    }
    if (kexts.includes('VoodooPS2Controller.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o VoodooPS2Controller-2.2.7-RELEASE.zip https://github.com/acidanthera/VoodooPS2/releases/download/2.2.7/VoodooPS2Controller-2.2.7-RELEASE.zip; mkdir VoodooPS2Controller-2.2.7-RELEASE; cd VoodooPS2Controller-2.2.7-RELEASE; unzip ../VoodooPS2Controller-2.2.7-RELEASE.zip`);
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
    if (kexts.includes('AtherosE2200Ethernet.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o AtherosE2200Ethernet-V2.2.2.zip https://github.com/Mieze/AtherosE2200Ethernet/releases/download/2.2.2/AtherosE2200Ethernet-V2.2.2.zip; mkdir AtherosE2200Ethernet-V2.2.2; cd AtherosE2200Ethernet-V2.2.2; unzip ../AtherosE2200Ethernet-V2.2.2.zip`);
    }
    if (kexts.includes('USBInjectAll.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o RehabMan-USBInjectAll-2018-1108.zip https://bitbucket.org/RehabMan/os-x-usb-inject-all/downloads/RehabMan-USBInjectAll-2018-1108.zip; mkdir RehabMan-USBInjectAll-2018-1108; cd RehabMan-USBInjectAll-2018-1108; unzip ../RehabMan-USBInjectAll-2018-1108.zip`);
    }
    if (kexts.includes('XHCI-unsupported.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o OS-X-USB-Inject-All-master.zip https://github.com/RehabMan/OS-X-USB-Inject-All/archive/refs/heads/master.zip; mkdir OS-X-USB-Inject-All-master; cd OS-X-USB-Inject-All-master; unzip ../OS-X-USB-Inject-All-master.zip`);
    }
    if (kexts.includes('IntelMausi.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o IntelMausi-1.0.7-RELEASE.zip https://github.com/acidanthera/IntelMausi/releases/download/1.0.7/IntelMausi-1.0.7-RELEASE.zip; mkdir IntelMausi-1.0.7-RELEASE; cd IntelMausi-1.0.7-RELEASE; unzip ../IntelMausi-1.0.7-RELEASE.zip`);
    }
    if (kexts.includes('NVMeFix.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o NVMeFix-1.0.9-RELEASE.zip https://github.com/acidanthera/NVMeFix/releases/download/1.0.9/NVMeFix-1.0.9-RELEASE.zip; mkdir NVMeFix-1.0.9-RELEASE; cd NVMeFix-1.0.9-RELEASE; unzip ../NVMeFix-1.0.9-RELEASE.zip`);
    }
    if (kexts.includes('itlwm.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o itlwm-2.1.0.zip https://github.com/OpenIntelWireless/itlwm/releases/download/v2.1.0/itlwm_v2.1.0_stable.kext.zip; mkdir itlwm-2.1.0; cd itlwm-2.1.0; unzip ../itlwm-2.1.0.zip`);
    }
    if (kexts.includes('AirportItlwm.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o AirportItlwm-2.1.0.zip https://github.com/OpenIntelWireless/itlwm/releases/download/v2.1.0/AirportItlwm_v2.1.0_stable_${os.release().startsWith('21.') ? 'Monterey' : (os.release().startsWith('20.') ? 'BigSur' : (os.release().startsWith('19.') ? 'Catalina' : (os.release().startsWith('18.') ? 'Mojave' : 'HighSierra')))}.kext.zip; mkdir AirportItlwm-2.1.0; cd AirportItlwm-2.1.0; unzip ../AirportItlwm-2.1.0.zip`);
    }
    if (kexts.includes('IntelBluetoothFirmware.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o IntelBluetoothFirmware-2.1.0.zip https://github.com/OpenIntelWireless/IntelBluetoothFirmware/releases/download/v2.1.0/IntelBluetoothFirmware-v2.1.0.zip; mkdir IntelBluetoothFirmware-2.1.0; cd IntelBluetoothFirmware-2.1.0; unzip ../IntelBluetoothFirmware-2.1.0.zip`);
    }
    if (kexts.includes('CpuTscSync.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o CpuTscSync-1.0.6-RELEASE.zip https://github.com/acidanthera/CpuTscSync/releases/download/1.0.6/CpuTscSync-1.0.6-RELEASE.zip; mkdir CpuTscSync-1.0.6-RELEASE; cd CpuTscSync-1.0.6-RELEASE; unzip ../CpuTscSync-1.0.6-RELEASE.zip`);
    }
    if (kexts.includes('CPUFriend.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o CPUFriend-1.2.4-RELEASE.zip https://github.com/acidanthera/CPUFriend/releases/download/1.2.4/CPUFriend-1.2.4-RELEASE.zip; mkdir CPUFriend-1.2.4-RELEASE; cd CPUFriend-1.2.4-RELEASE; unzip ../CPUFriend-1.2.4-RELEASE.zip`);
    }
    if (kexts.includes('AirportBrcmFixup.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o AirportBrcmFixup-2.1.4-RELEASE.zip https://github.com/acidanthera/AirportBrcmFixup/releases/download/2.1.4/AirportBrcmFixup-2.1.4-RELEASE.zip; mkdir AirportBrcmFixup-2.1.4-RELEASE; cd AirportBrcmFixup-2.1.4-RELEASE; unzip ../AirportBrcmFixup-2.1.4-RELEASE.zip`);
    }
    /*
    if kexts include one of these - check all of them together

    BlueToolFixup.kext
    BrcmBluetoothInjector.kext
    BrcmBluetoothInjectorLegacy.kext
    BrcmFirmwareData.kext
    BrcmFirmwareRepo.kext
    BrcmNonPatchRAM.kext
    BrcmNonPatchRAM2.kext
    BrcmPatchRAM.kext
    BrcmPatchRAM2.kext
    BrcmPatchRAM3.kext
    */
    if (kexts.includes('BlueToolFixup.kext') || kexts.includes('BrcmBluetoothInjector.kext') || kexts.includes('BrcmBluetoothInjectorLegacy.kext') || kexts.includes('BrcmFirmwareData.kext') || kexts.includes('BrcmFirmwareRepo.kext') || kexts.includes('BrcmNonPatchRAM.kext') || kexts.includes('BrcmNonPatchRAM2.kext') || kexts.includes('BrcmPatchRAM.kext') || kexts.includes('BrcmPatchRAM2.kext') || kexts.includes('BrcmPatchRAM3.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o BrcmPatchRAM-2.6.1-RELEASE.zip https://github.com/acidanthera/BrcmPatchRAM/releases/download/2.6.1/BrcmPatchRAM-2.6.1-RELEASE.zip; mkdir BrcmPatchRAM-2.6.1-RELEASE; cd BrcmPatchRAM-2.6.1-RELEASE; unzip ../BrcmPatchRAM-2.6.1-RELEASE.zip`);
    }
    if (kexts.includes('CtlnaAHCIPort.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o CtlnaAHCIPort.kext.zip https://github.com/dortania/OpenCore-Install-Guide/raw/master/extra-files/CtlnaAHCIPort.kext.zip; mkdir CtlnaAHCIPort; cd CtlnaAHCIPort; unzip ../CtlnaAHCIPort.kext.zip`);
    }
    if (kexts.includes('SATA-unsupported.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o SATA-unsupported.kext.zip https://github.com/khronokernel/Legacy-Kexts/raw/master/Injectors/Zip/SATA-unsupported.kext.zip; mkdir SATA-unsuppported; cd SATA-unsupported; unzip ../SATA-unsupported.kext.zip`);
    }
    if (kexts.includes('AppleMCEReporterDisabler.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o AppleMCEReporterDisabler.kext.zip https://github.com/acidanthera/bugtracker/files/3703498/AppleMCEReporterDisabler.kext.zip; mkdir AppleMCEReporterDisabler; cd AppleMCEReporterDisabler; unzip ../AppleMCEReporterDisabler.kext.zip`);
    }
    if (kexts.includes('RealtekCardReader.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o RealtekCardReader-0.9.6-RELEASE.zip https://github.com/0xFireWolf/RealtekCardReader/releases/download/v0.9.6/RealtekCardReader_0.9.6_b998818_RELEASE.zip; mkdir RealtekCardReader-0.9.6-RELEASE; cd RealtekCardReader-0.9.6-RELEASE; unzip ../RealtekCardReader-0.9.6-RELEASE.zip`);
    }
    if (kexts.includes('RealtekCardReaderFriend.kext')) {
        cp.execSync(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o RealtekCardReaderFriend-1.0.2-RELEASE.zip https://github.com/0xFireWolf/RealtekCardReaderFriend/releases/download/v1.0.2/RealtekCardReaderFriend_1.0.2_7f6639a_RELEASE.zip; mkdir RealtekCardReaderFriend-1.0.2-RELEASE; cd RealtekCardReaderFriend-1.0.2-RELEASE; unzip ../RealtekCardReaderFriend-1.0.2-RELEASE.zip`);
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
    fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.8-RELEASE/X64/EFI/BOOT/BOOTx64.efi`, `${dir}/BOOT/BOOTx64.efi`);
    fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.8-RELEASE/X64/EFI/OC/OpenCore.efi`, `${dir}/OC/OpenCore.efi`);
    if (fs.existsSync(`${dir}/OC/Tools/VerifyMsrE2.efi`)) fs.renameSync(`${dir}/OC/Tools/VerifyMsrE2.efi`, `${dir}/OC/Tools/ControlMsrE2.efi`);
    // if VBoxHfs.efi exists at ${dir}/OC/Drivers, rename it to OpenHfsPlus.efi
    if (fs.existsSync(`${dir}/OC/Drivers/VBoxHfs.efi`)) fs.renameSync(`${dir}/OC/Drivers/VBoxHfs.efi`, `${dir}/OC/Drivers/OpenHfsPlus.efi`);
    for (let driver of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.8-RELEASE/X64/EFI/OC/Drivers`)) {
        if (fs.existsSync(`${dir}/OC/Drivers/${driver}`)) {
            fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.8-RELEASE/X64/EFI/OC/Drivers/${driver}`, `${dir}/OC/Drivers/${driver}`);
        }
    }
    for (let driver of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Drivers`)) {
        if (fs.existsSync(`${dir}/OC/Drivers/${driver}`)) {
            fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Drivers/${driver}`, `${dir}/OC/Drivers/${driver}`);
        }
    }
    for (let tool of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.8-RELEASE/X64/EFI/OC/Tools`)) {
        if (fs.existsSync(`${dir}/OC/Tools/${tool}`)) {
            fs.copyFileSync(`${os.homedir()}/.oc-update/${PID}/OpenCore-0.7.8-RELEASE/X64/EFI/OC/Tools/${tool}`, `${dir}/OC/Tools/${tool}`);
        }
    }
    cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Resources" "${dir}/OC"`);
    if (kexts.includes('VirtualSMC.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.8-RELEASE/Kexts/VirtualSMC.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCProcessor.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.8-RELEASE/Kexts/SMCProcessor.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCSuperIO.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.8-RELEASE/Kexts/SMCSuperIO.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCBatteryManager.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.8-RELEASE/Kexts/SMCBatteryManager.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCLightSensor.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.8-RELEASE/Kexts/SMCLightSensor.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('SMCDellSensors.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VirtualSMC-1.2.8-RELEASE/Kexts/SMCDellSensors.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('Lilu.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/Lilu-1.6.0-RELEASE/Lilu.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('WhateverGreen.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/WhateverGreen-1.5.7-RELEASE/WhateverGreen.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('AppleALC.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AppleALC-1.6.9-RELEASE/AppleALC.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('AppleALCU.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AppleALC-1.6.9-RELEASE/AppleALCU.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('VoodooPS2Controller.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/VoodooPS2Controller-2.2.7-RELEASE/VoodooPS2Controller.kext" "${dir}/OC/Kexts"`);
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
    if (kexts.includes('AtherosE2200Ethernet.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AtherosE2200Ethernet-V2.2.2/AtherosE2200Ethernet-V2.2.2/Release/AtherosE2200Ethernet.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('USBInjectAll.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/RehabMan-USBInjectAll-2018-1108/Release/USBInjectAll.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('XHCI-unsupported.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/OS-X-USB-Inject-All-master/OS-X-USB-Inject-All-master/XHCI-unsupported.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('IntelMausi.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/IntelMausi-1.0.7-RELEASE/IntelMausi.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('NVMeFix.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/NVMeFix-1.0.9-RELEASE/NVMeFix.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('itlwm.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/itlwm-2.1.0/itlwm.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('AirportItlwm.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AirportItlwm-2.1.0/${os.release().startsWith('21.') ? 'Monterey' : (os.release().startsWith('20.') ? 'Big Sur' : (os.release().startsWith('19.') ? 'Catalina' : (os.release().startsWith('18.') ? 'Mojave' : 'High Sierra')))}/AirportItlwm.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('IntelBluetoothFirmware.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware-2.1.0/IntelBluetoothFirmware.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('IntelBluetoothInjector.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware-2.1.0/IntelBluetoothInjector.kext" "${dir}/OC/Kexts"`);
    }
    // CpuTscSync.kext -> replace with CpuTscSync-1.0.6-RELEASE/CpuTscSync.kext
    if (kexts.includes('CpuTscSync.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/CpuTscSync-1.0.6-RELEASE/CpuTscSync.kext" "${dir}/OC/Kexts"`);
    }
    // CPUFriend.kext -> replace with CPUFriend-1.2.4-RELEASE/CPUFriend.kext
    if (kexts.includes('CPUFriend.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/CPUFriend-1.2.4-RELEASE/CPUFriend.kext" "${dir}/OC/Kexts"`);
    }
    // AirportBrcmFixup.kext -> replace with AirportBrcmFixup-2.1.4-RELEASE/AirportBrcmFixup.kext
    if (kexts.includes('AirportBrcmFixup.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AirportBrcmFixup-2.1.4-RELEASE/AirportBrcmFixup.kext" "${dir}/OC/Kexts"`);
    }
    /*
    if one of these kexts are installed: replace it with the appropriate kext in BrcmPatchRAM-2.6.1-RELEASE
    these kexts include:

    BlueToolFixup.kext
    BrcmBluetoothInjector.kext
    BrcmBluetoothInjectorLegacy.kext
    BrcmFirmwareData.kext
    BrcmFirmwareRepo.kext
    BrcmNonPatchRAM.kext
    BrcmNonPatchRAM2.kext
    BrcmPatchRAM.kext
    BrcmPatchRAM2.kext
    BrcmPatchRAM3.kext
    */
    if (kexts.includes('BlueToolFixup.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BlueToolFixup.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmBluetoothInjector.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmBluetoothInjector.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmBluetoothInjectorLegacy.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmBluetoothInjectorLegacy.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmFirmwareData.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmFirmwareData.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmFirmwareRepo.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmFirmwareRepo.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmNonPatchRAM.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmNonPatchRAM.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmNonPatchRAM2.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmNonPatchRAM2.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmPatchRAM.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmPatchRAM.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmPatchRAM2.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmPatchRAM2.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('BrcmPatchRAM3.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM-2.6.1-RELEASE/BrcmPatchRAM3.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('CtlnaAHCIPort.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/CtlnaAHCIPort/CtlnaAHCIPort.kext" "${dir}/OC/Kexts"`);
    }
    // do the same for SATA-unsupported and AppleMCEReporterDisabler
    if (kexts.includes('SATA-unsupported.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/SATA-unsupported/SATA-unsupported.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes('AppleMCEReporterDisabler.kext')) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/AppleMCEReporterDisabler/AppleMCEReporterDisabler.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes("RealtekCardReader.kext")) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/RealtekCardReader-0.9.6-RELEASE/RealtekCardReader.kext" "${dir}/OC/Kexts"`);
    }
    if (kexts.includes("RealtekCardReaderFriend.kext")) {
        cp.execSync(`cp -r "${os.homedir()}/.oc-update/${PID}/RealtekCardReaderFriend-1.0.2-RELEASE/RealtekCardReaderFriend.kext" "${dir}/OC/Kexts"`);
    }
    evt.returnValue = 'success'
});
electron.ipcMain.on('update-config-plist', (evt, efidir, ocver) => {
    while (true) {
        if (ocver == 78) break;
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
    const plistParsed: any = plist.parse(fs.readFileSync(`${efidir}/OC/${fs.existsSync(`${efidir}/OC/config.plist`) ? 'c' : 'C'}onfig.plist`, 'utf8'));
    if (plistParsed.Misc.Security.Vault != 'Optional') {
        plistParsed.Misc.Security.Vault = 'Optional';
        // build plistParsed, and write it back to file
        fs.writeFileSync(`${efidir}/OC/${fs.existsSync(`${efidir}/OC/config.plist`) ? 'c' : 'C'}onfig.plist`, plist.build(plistParsed));
        evt.returnValue = 'vault-disabled';
        return;
    }
    evt.returnValue = 'success'
});
electron.ipcMain.on('finish', (evt, efidir) => {
    cp.execSync(`rm -rf ${os.homedir()}/.oc-update/${PID}`);
    // read config.plist or Config.plist and assign to plistRaw (type string)
    let plistRaw: string = fs.readFileSync(`${efidir}/OC/${fs.existsSync(`${efidir}/OC/config.plist`) ? 'c' : 'C'}onfig.plist`, 'utf8');
    // don't parse plistRaw
    // in plistRaw, replace all <data/> to <data></data>
    // replace all <string/> to <string></string>
    // do the same for all <array/> and <dict/>
    // don't use regex, instead use while true and break
    while (true) {
        if (plistRaw.includes('<data/>')) {
            plistRaw = plistRaw.replace('<data/>', '<data></data>');
        } else {
            break;
        }
    }
    while (true) {
        if (plistRaw.includes('<string/>')) {
            plistRaw = plistRaw.replace('<string/>', '<string></string>');
        } else {
            break;
        }
    }
    while (true) {
        if (plistRaw.includes('<array/>')) {
            plistRaw = plistRaw.replace('<array/>', '<array></array>');
        } else {
            break;
        }
    }
    while (true) {
        if (plistRaw.includes('<dict/>')) {
            plistRaw = plistRaw.replace('<dict/>', '<dict></dict>');
        } else {
            break;
        }
    }
    // write plistRaw back
    fs.writeFileSync(`${efidir}/OC/${fs.existsSync(`${efidir}/OC/config.plist`) ? 'c' : 'C'}onfig.plist`, plistRaw);
    evt.returnValue = `${os.homedir()}/EFI-${PID}`;
});
electron.ipcMain.on('check-bootstrap', (evt, efidir) => {
    // read ${efidir}/OC directory, if Bootstrap directory doesn't exist, return false
    // otherwise, read ${efidir}/OC/config.plist or ${efidir}/OC/Config.plist
    // if plist - Misc - Security - BootProtect is either Bootstrap or BootstrapShort, return true
    // otherwise, return false
    if (!fs.readdirSync(`${efidir}/OC`).includes('Bootstrap')) {
        evt.returnValue = false;
        return;
    }
    const plistParsed: any = plist.parse(fs.readFileSync(`${efidir}/OC/${fs.existsSync(`${efidir}/OC/config.plist`) ? 'c' : 'C'}onfig.plist`, 'utf8'));
    if (plistParsed.Misc.Security.BootProtect == 'Bootstrap' || plistParsed.Misc.Security.BootProtect == 'BootstrapShort') {
        evt.returnValue = true;
        return;
    }
    evt.returnValue = false;
});
electron.ipcMain.on('quit', () => {
    app.quit();
});
