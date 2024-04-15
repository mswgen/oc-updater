import electron, { BrowserWindow, app } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import cp from 'child_process';
import plist from 'plist';
import util from 'util';
import { autoUpdater } from 'electron-updater';
const checksums = {
    'bd8eacc89485592fcb6ae09a9869ea77f50e5620c0503b5eed8a4f463fe068c7': '0.9.9',
    '952009b5ec2abfd94bb8b8cc50726dccf76f615771bd6cd6e9450205a4ad33c0': '0.9.9',
    '2b522620488affbc71bab1057e020309f5af4335138e730770f3a8f9f32a7d1c': '0.9.8',
    '3c4fe37014381aa7f4e4e88b2110280982c5f6fb7ae96ec9dab7b7c8d8f3097e': '0.9.8',
    'd5c1a8ab4f8c29a2967dc363ddbe671cbb711546e7edde015a37dd50171f8109': '0.9.7',
    '17cb2c28ee3d32566a9c31c4238ff6ad4d4d1f5d83d5c799cd12265f5c626772': '0.9.7',
    'bc5a6c8fbd2cbfc7f41fc256bc4eb7c9fc16d30fa5d250d06e6dd6f21902ddc3': '0.9.6',
    'dedd0673df265737b2cb35abe96f1f1a329bc6b203d20bd9e70bc64dac1fd0c2': '0.9.6',
    'd477b2df332da3debf309c65d75cbd234663ead11e9afd7595ededd1c9d3641d': '0.9.5',
    '92f4925887808635a3315c86bb47c2f6e62e9c7d631736eca9653e4668694538': '0.9.5',
    'dad93195c897adb324b8d8364d1b07fa1dd48fa95280d11c613a409f4ccb20ca': '0.9.4',
    '88aa4d87ac6782a943a97527e24f6d3423f3cd706f7042c72b6c1475d78e572f': '0.9.4',
    'b1599f3c2dff751367d907fade59020d356344a7413e18ed474193046a2bc7ba': '0.9.3',
    '444d287a497bfd087195ed3451ed06e11eb168f8c108de32be493ddeea22071c': '0.9.3',
    '3b9252efdc3798ea73e6e9fc37ca812d59eaacb2c4cd2a7cf6658bc8cab88ae5': '0.9.2',
    '5d8f82d5333b4d5f93ade2300ddaeb359db33db1424083ac1891ff827d3ec354': '0.9.2',
    '6129ad67049b1d4328e31dc3ab7e545dac9c404a7b2f53fdee462170fed36ea8': '0.9.1',
    '8f8cafcd8ba2773d46686d407049b57327cd8199a4d34801c7332a4daac1f597': '0.9.1',
    'd7092e886803f8775557378b7d80b75b6813ccf2f8eb507160ff14dc258455be': '0.9.0',
    '57d2d66a01f9fd225d7f92616b0bff4b2d1fd5036400acb76a2e8704f694789d': '0.9.0',
    '5bc6f10ff45a1ee8558dec953e3ee8990ca2ab0dcc6e4750f130b42211f5333a': '0.8.9',
    '9a8b23aabff27a1850555d561961ed69c23496346a2b4d609b7cc68269ed9de2': '0.8.9',
    '70329873e36573ebfe81ba53fc6800bd513cad3644371f1600819ded772b171a': '0.8.8',
    '674d63caa32fb7e959e3840992e28c6ebc41bb2f96a6940ae241904e0d16bff7': '0.8.8',
    '80fb8017dffa74dea70fc0ee0baf10b57d47ad51f2fa7a0915c9760e48effc9c': '0.8.7',
    '48e87cd14d440ae122986c23b7442156d95c336e796bcd743ec5a904036c4fb8': '0.8.7',
    '562b0fb7905feac796863979e8e62de7065b89c60348e8226a3b86f338fbe90c': '0.8.6',
    '2b4fcc93e039f6ca289ec4cff5db5d94d50dab3eff2c70a05e44b738d5aa7fc6': '0.8.5',
    'a175242302a50511de74c080057c018a23f9e88467bf1c1b4d445f82c486c95b': '0.8.4',
    '168b2694c8edc9a80c818700c7ed2fa12daad38ed6d53be8c9cfb79c89ac67af': '0.8.4',
    '443ff1623cc618514cfc571b1f89ddd43526dbe349d5629ca529f2c42857b2e6': '0.8.3',
    '3dc7df26265e80b3bd93033e485abf11fc29026c23c8623f8748403ccc07c7f9': '0.8.2',
    '93871f5d2dab7feb315d1a25e98cfe8fe4a1e94cd9f69a7db430abb8f66ec90f': '0.8.2',
    '27f4252f1fa8de69d9d3198032d8b16252cccd514ffd73d4de59dbb05543586d': '0.8.1',
    '8599d2300b54a537f1f06024800ecd094a233e8b7422cd7c8463beb521e628d4': '0.8.1',
    'fd918e96a271e3bd7cebed9f5fcdbf8437fa91640d8e58f9ab950f03bec360fe': '0.8.0',
    'f41bc1a6c5ad2eab6b753c365e905253bd6f86a5c3e605c1dd190b9a3a8a544f': '0.8.0',
    '297602a36ba60b3968e876297fc5d94770a7abefffdc7ed59cd56a9bd01f8917': '0.7.9',
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
const versions = {
    OpenCore: ['0.9.9', 99],
    VirtualSMC: '1.3.2',
    Lilu: '1.6.7',
    WhateverGreen: '1.6.6',
    AppleALC: '1.8.9',
    VoodooPS2Controller: '2.3.5',
    VoodooI2C: '2.8',
    ECEnabler: '1.0.4',
    BrightnessKeys: '1.0.3',
    RealtekRTL8111: '2.4.2',
    AtherosE2200Ethernet: '2.2.2',
    USBInjectAll: '2018-1108',
    IntelMausi: '1.0.7',
    NVMeFix: '1.1.1',
    itlwm: '2.2.0',
    IntelBluetoothFirmware: '2.4.0',
    CpuTscSync: '1.1.0',
    CPUFriend: '1.2.7',
    HibernationFixup: '1.4.9',
    AirportBrcmFixup: '2.1.8',
    BrcmPatchRAM: '2.6.8',
    FeatureUnlock: '1.1.5',
    RestrictEvents: '1.1.3',
    CpuTopologyRebuild: '1.1.0',
    RealtekCardReader: ['0.9.7', '0.9.7_006a845'],
    RealtekCardReaderFriend: ['1.0.4', '1.0.4_e1e3301']
}
const updates: any = {};
let isLoaded = false;
for (let file of fs.readdirSync(`${__dirname}/update`).filter(x => x.endsWith('.js'))) {
    const mod = require(`./update/${file}`).default;
    if (!mod.from || (mod.configPlistChange != true && mod.configPlistChange != false)) continue;
    updates[mod.from] = mod;
}
let openPath: string | null = null;
app.on('open-file', async (evt, path) => {
    evt.preventDefault();
    openPath = path;
    if (isLoaded) window.webContents.send('init-dir', path);
});
const cpexec = util.promisify(cp.exec);
let window: electron.BrowserWindow;
function createWindow(): void {
    window = new electron.BrowserWindow({
        width: 480,
        height: 720,
        webPreferences: {
            preload: `${__dirname}/preload.js`,
            enableBlinkFeatures: 'CSSColorSchemeUARendering'
        },
        show: false,
        resizable: false
    });
    window.once('ready-to-show', window.show);
    window.loadFile(path.join(__dirname, app.getLocale() == 'ko' ? '../index-korean.html' : '../index.html'));
    window.webContents.once('did-finish-load', () => {
        isLoaded = true;
    });
    if (openPath) {
        window.webContents.once('did-finish-load', () => {
            window.webContents.send('init-dir', openPath);
        });
    }
}
app.commandLine.appendSwitch('disable-http2');
autoUpdater.requestHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' };
electron.app.whenReady().then(() => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify({
        title: app.getLocale() == 'ko' ? '업데이트를 설치할 준비가 완료되었습니다.' : 'An update is ready to install.',
        body: app.getLocale() == 'ko' ? '{appName} 버전 {version}이 다운로드되었으며, 앱 종료 시 자동으로 설치됩니다.' : '{appName} version {version} has been downloaded and will be automatically installed on exit'
    });
    electron.app.on('activate', (_, hasVisibleWindows) => {
        if (!hasVisibleWindows) createWindow();
    });
    electron.app.on('window-all-closed', electron.app.quit);
});
electron.nativeTheme.on('updated', () => {
    window.webContents.send('theme', electron.nativeTheme.shouldUseDarkColors);
});
electron.ipcMain.on('get-theme', evt => {
    evt.reply('theme', electron.nativeTheme.shouldUseDarkColors);
});
electron.ipcMain.on('open-folder', (evt, dir) => {
    electron.shell.showItemInFolder(dir);
});
electron.ipcMain.on('get-latest', evt => {
    evt.returnValue = versions['OpenCore'];
});
electron.ipcMain.on('select-efi-directory', evt => {
    const dir = electron.dialog.showOpenDialogSync(window, {
        title: 'Select EFI directory',
        buttonLabel: app.getLocale() == 'ko' ? '선택하기' : 'Select',
        properties: ['openDirectory', 'showHiddenFiles'],
        message: app.getLocale() == 'ko' ? '업데이트할 EFI 디렉토리를 선택해주세요. 디렉토리 바로 아래에 BOOT와 OC 디렉토리가 있어야 합니다.' : 'Select EFI directory to update. Directory should contain BOOT and OC directories.'
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
    if (!secondDepth.includes('ACPI') || !secondDepth.includes('Drivers') || !secondDepth.includes('Kexts') || !secondDepth.includes('OpenCore.efi') || !(secondDepth.includes('config.plist') || secondDepth.includes('Config.plist'))) {
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
        evt.returnValue = null;
    }
});
electron.ipcMain.on('kextinfo', (evt, kextdir) => {
    evt.returnValue = fs.readdirSync(kextdir).filter(x => x.endsWith('.kext')).filter(x => !x.startsWith('._'));
});
electron.ipcMain.on('download-oc', async (evt, ocver, kexts, PID) => {
    await cpexec(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o OpenCore.zip https://github.com/acidanthera/OpenCorePkg/releases/download/${versions.OpenCore[0]}/OpenCore-${versions.OpenCore[0]}-RELEASE.zip; mkdir OpenCore; cd OpenCore; unzip ../OpenCore.zip`);
    evt.reply('downloaded-oc', ocver, kexts, PID);
});
electron.ipcMain.on('download-kexts', async (evt, ocver, kexts, PID) => {
    let kextsToDownload: Array<{
        url: string,
        name: string
    }> = [];
    let downloadedCount = 0;
    if (kexts.includes('VirtualSMC.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/VirtualSMC/releases/download/${versions.VirtualSMC}/VirtualSMC-${versions.VirtualSMC}-RELEASE.zip`,
            name: 'VirtualSMC'
        });
    }
    if (kexts.includes('Lilu.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/Lilu/releases/download/${versions.Lilu}/Lilu-${versions.Lilu}-RELEASE.zip`,
            name: 'Lilu'
        });
    }
    if (kexts.includes('WhateverGreen.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/WhateverGreen/releases/download/${versions.WhateverGreen}/WhateverGreen-${versions.WhateverGreen}-RELEASE.zip`,
            name: 'WhateverGreen'
        });
    }
    if (kexts.includes('AppleALC.kext') || kexts.includes('AppleALCU.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/AppleALC/releases/download/${versions.AppleALC}/AppleALC-${versions.AppleALC}-RELEASE.zip`,
            name: 'AppleALC'
        });
    }
    if (kexts.includes('VoodooPS2Controller.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/VoodooPS2/releases/download/${versions.VoodooPS2Controller}/VoodooPS2Controller-${versions.VoodooPS2Controller}-RELEASE.zip`,
            name: 'VoodooPS2Controller'
        });
    }
    if (kexts.includes('VoodooI2C.kext')) {
        kextsToDownload.push({
            url: `https://github.com/VoodooI2C/VoodooI2C/releases/download/${versions.VoodooI2C}/VoodooI2C-${versions.VoodooI2C}.zip`,
            name: 'VoodooI2C'
        });
    }
    if (kexts.includes('ECEnabler.kext')) {
        kextsToDownload.push({
            url: `https://github.com/1Revenger1/ECEnabler/releases/download/${versions.ECEnabler}/ECEnabler-${versions.ECEnabler}-RELEASE.zip`,
            name: 'ECEnabler'
        });
    }
    if (kexts.includes('BrightnessKeys.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/BrightnessKeys/releases/download/${versions.BrightnessKeys}/BrightnessKeys-${versions.BrightnessKeys}-RELEASE.zip`,
            name: 'BrightnessKeys'
        });
    }
    if (kexts.includes('RealtekRTL8111.kext')) {
        kextsToDownload.push({
            url: `https://github.com/Mieze/RTL8111_driver_for_OS_X/releases/download/${versions.RealtekRTL8111}/RealtekRTL8111-V${versions.RealtekRTL8111}.zip`,
            name: 'RealtekRTL8111'
        });
    }
    if (kexts.includes('AtherosE2200Ethernet.kext')) {
        kextsToDownload.push({
            url: `https://github.com/Mieze/AtherosE2200Ethernet/releases/download/${versions.AtherosE2200Ethernet}/AtherosE2200Ethernet-V${versions.AtherosE2200Ethernet}.zip`,
            name: 'AtherosE2200Ethernet'
        });
    }
    if (kexts.includes('USBInjectAll.kext')) {
        kextsToDownload.push({
            url: `https://bitbucket.org/RehabMan/os-x-usb-inject-all/downloads/RehabMan-USBInjectAll-${versions.USBInjectAll}.zip`,
            name: 'RehabMan-USBInjectAll'
        });
    }
    if (kexts.includes('XHCI-unsupported.kext')) {
        kextsToDownload.push({
            url: `https://github.com/RehabMan/OS-X-USB-Inject-All/archive/refs/heads/master.zip`,
            name: 'OS-X-USB-Inject-All-master'
        });
    }
    if (kexts.includes('IntelMausi.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/IntelMausi/releases/download/${versions.IntelMausi}/IntelMausi-${versions.IntelMausi}-RELEASE.zip`,
            name: 'IntelMausi'
        });
    }
    if (kexts.includes('NVMeFix.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/NVMeFix/releases/download/${versions.NVMeFix}/NVMeFix-${versions.NVMeFix}-RELEASE.zip`,
            name: 'NVMeFix'
        });
    }
    if (kexts.includes('itlwm.kext')) {
        kextsToDownload.push({
            url: `https://github.com/OpenIntelWireless/itlwm/releases/download/v${versions.itlwm}/itlwm_v${versions.itlwm}_stable.kext.zip`,
            name: 'itlwm'
        });
    }
    if (kexts.includes('AirportItlwm.kext')) {
        kextsToDownload.push({
            url: os.release().startsWith('23.') ? (
                parseInt(os.release().split('.')[1]) >= 4 ? 'https://raw.githubusercontent.com/mswgen/oc-updater/v1/AirportItlwm-Sonoma14.4-v2.3.0-DEBUG-alpha-e886ebb.zip'
                : `https://raw.githubusercontent.com/mswgen/oc-updater/v1/AirportItlwm-Sonoma14.0-v2.3.0-DEBUG-alpha-e886ebb.zip`
            ) : `https://github.com/OpenIntelWireless/itlwm/releases/download/v${versions.itlwm}/AirportItlwm_v${versions.itlwm}_stable_${/*os.release().startsWith('23.') ? 'Sonoma' : */(os.release().startsWith('22.') ? 'Ventura' : (os.release().startsWith('21.') ? 'Monterey' : (os.release().startsWith('20.') ? 'BigSur' : (os.release().startsWith('19.') ? 'Catalina' : (os.release().startsWith('18.') ? 'Mojave' : 'HighSierra')))))}.kext.zip`,
            name: 'AirportItlwm'
        });
    }
    if (kexts.includes('IntelBluetoothFirmware.kext')) {
        kextsToDownload.push({
            url: `https://github.com/OpenIntelWireless/IntelBluetoothFirmware/releases/download/v${versions.IntelBluetoothFirmware}/IntelBluetooth-v${versions.IntelBluetoothFirmware}.zip`,
            name: 'IntelBluetoothFirmware'
        });
    }
    if (kexts.includes('CpuTscSync.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/CpuTscSync/releases/download/${versions.CpuTscSync}/CpuTscSync-${versions.CpuTscSync}-RELEASE.zip`,
            name: 'CpuTscSync'
        });
    }
    if (kexts.includes('CPUFriend.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/CPUFriend/releases/download/${versions.CPUFriend}/CPUFriend-${versions.CPUFriend}-RELEASE.zip`,
            name: 'CPUFriend'
        });
    }
    if (kexts.includes('HibernationFixup.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/HibernationFixup/releases/download/${versions.HibernationFixup}/HibernationFixup-${versions.HibernationFixup}-RELEASE.zip`,
            name: 'HibernationFixup'
        });
    }
    if (kexts.includes('FeatureUnlock.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/FeatureUnlock/releases/download/${versions.FeatureUnlock}/FeatureUnlock-${versions.FeatureUnlock}-RELEASE.zip`,
            name: 'FeatureUnlock'
        });
    }
    if (kexts.includes('RestrictEvents.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/RestrictEvents/releases/download/${versions.RestrictEvents}/RestrictEvents-${versions.RestrictEvents}-RELEASE.zip`,
            name: 'RestrictEvents'
        });
    }
    if (kexts.includes('CpuTopologyRebuild.kext')) {
        kextsToDownload.push({
            url: `https://github.com/b00t0x/CpuTopologyRebuild/releases/download/${versions.CpuTopologyRebuild}/CpuTopologyRebuild-${versions.CpuTopologyRebuild}-RELEASE.zip`,
            name: 'CpuTopologyRebuild'
        });
    }
    if (kexts.includes('AirportBrcmFixup.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/AirportBrcmFixup/releases/download/${versions.AirportBrcmFixup}/AirportBrcmFixup-${versions.AirportBrcmFixup}-RELEASE.zip`,
            name: 'AirportBrcmFixup'
        });
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
        kextsToDownload.push({
            url: `https://github.com/acidanthera/BrcmPatchRAM/releases/download/${versions.BrcmPatchRAM}/BrcmPatchRAM-${versions.BrcmPatchRAM}-RELEASE.zip`,
            name: 'BrcmPatchRAM'
        });
    }
    if (kexts.includes('CtlnaAHCIPort.kext')) {
        kextsToDownload.push({
            url: `https://github.com/dortania/OpenCore-Install-Guide/raw/master/extra-files/CtlnaAHCIPort.kext.zip`,
            name: 'CtlnaAHCIPort'
        });
    }
    if (kexts.includes('SATA-unsupported.kext')) {
        kextsToDownload.push({
            url: `https://github.com/khronokernel/Legacy-Kexts/raw/master/Injectors/Zip/SATA-unsupported.kext.zip`,
            name: 'SATA-unsupported'
        });
    }
    if (kexts.includes('AppleMCEReporterDisabler.kext')) {
        kextsToDownload.push({
            url: `https://github.com/acidanthera/bugtracker/files/3703498/AppleMCEReporterDisabler.kext.zip`,
            name: 'AppleMCEReporterDisabler'
        });
    }
    if (kexts.includes('RealtekCardReader.kext')) {
        kextsToDownload.push({
            url: `https://github.com/0xFireWolf/RealtekCardReader/releases/download/v${versions.RealtekCardReader[0]}/RealtekCardReader_${versions.RealtekCardReader[1]}_RELEASE.zip`,
            name: 'RealtekCardReader'
        });
    }
    if (kexts.includes('RealtekCardReaderFriend.kext')) {
        kextsToDownload.push({
            url: 'https://raw.githubusercontent.com/mswgen/oc-updater/v1/RealtekCardReaderFriend_1.0.4_a2cea90_RELEASE.zip', //`https://github.com/0xFireWolf/RealtekCardReaderFriend/releases/download/v${versions.RealtekCardReaderFriend[0]}/RealtekCardReaderFriend_${versions.RealtekCardReaderFriend[1]}_RELEASE.zip`,
            name: 'RealtekCardReaderFriend'
        });
    }
    window.webContents.send('kextprogress', ocver, kexts, PID, 0, kextsToDownload.length);
    await Promise.all(kextsToDownload.map(async kext => {
        await cpexec(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o ${kext.name}.zip ${kext.url}; mkdir ${kext.name}; cd ${kext.name}; unzip ../${kext.name}.zip`);
        downloadedCount++;
        window.webContents.send('kextprogress', ocver, kexts, PID, downloadedCount, kextsToDownload.length);
    }));
    evt.reply('downloaded-kexts', ocver, kexts, PID);
});
electron.ipcMain.on('download-bindata', async (evt, ocver, kexts, PID) => {
    await cpexec(`cd ~; mkdir -p .oc-update/${PID}; cd .oc-update/${PID}; curl -L -s -o OcBinaryData-master.zip https://github.com/acidanthera/OcBinaryData/archive/refs/heads/master.zip; mkdir OcBinaryData-master; cd OcBinaryData-master; unzip ../OcBinaryData-master.zip`);
    electron.ipcMain.on('confirm-reply', async (event, pid, id, result) => {
        if (pid == PID && id == 'bindata') {
            if (result) {
                await fs.promises.rm(`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Resources/Audio/OCEFIAudio_VoiceOver_Boot.mp3`);
                await fs.promises.copyFile(`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Resources/Audio/AXEFIAudio_VoiceOver_Boot.mp3`, `${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Resources/Audio/OCEFIAudio_VoiceOver_Boot.mp3`);
            }
            evt.reply('downloaded-bindata', ocver, kexts, PID);
        }
    });
    window.webContents.send('confirm', PID, 'bindata', 'OpenCore 부팅음은 Mac의 실제 부팅음과 다르지만, 바이너리 데이터에는 OpenCore 부팅음과 Mac 부팅음이 모두 포함되어 있습니다. Mac 부팅음을 사용하시겠습니까?', 'The OpenCore boot chime is different from the real Mac boot chime, but both are included in the binary data. Would you like to use the real Mac boot chime?');
});
electron.ipcMain.on('create-backup', (evt, ocver, kexts, PID, dir) => {
    if (!fs.existsSync(`${os.homedir()}/EFI Backup`) || !fs.lstatSync(`${os.homedir()}/EFI Backup`).isDirectory()) fs.mkdirSync(`${os.homedir()}/EFI Backup`);
    let backupDir = `${os.homedir()}/EFI Backup/OC ${ocver}`;
    let i = 1;
    while (true) {
        if (!fs.existsSync(backupDir)) break;
        backupDir = `${os.homedir()}/EFI Backup/OC ${ocver} ${++i}`;
    }
    fs.mkdirSync(backupDir);
    cp.execSync(`cp -r "${dir}" "${backupDir}"`);
    evt.reply('created-backup', ocver, kexts, PID, backupDir);
});
electron.ipcMain.on('update-files', async (evt, ocver, kexts, PID, dir, backupDir) => {
    let filesToUpdate: Array<Array<string>> = [];
    let fileCount = 0;
    filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/OpenCore/X64/EFI/BOOT/BOOTx64.efi`, `${dir}/BOOT/BOOTx64.efi`]);
    filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/OpenCore/X64/EFI/OC/OpenCore.efi`, `${dir}/OC/OpenCore.efi`]);
    if (fs.existsSync(`${dir}/OC/Tools/VerifyMsrE2.efi`)) fs.renameSync(`${dir}/OC/Tools/VerifyMsrE2.efi`, `${dir}/OC/Tools/ControlMsrE2.efi`);
    // if VBoxHfs.efi exists at ${dir}/OC/Drivers, rename it to OpenHfsPlus.efi
    if (fs.existsSync(`${dir}/OC/Drivers/VBoxHfs.efi`)) fs.renameSync(`${dir}/OC/Drivers/VBoxHfs.efi`, `${dir}/OC/Drivers/OpenHfsPlus.efi`);
    for (let driver of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OpenCore/X64/EFI/OC/Drivers`)) {
        if (fs.existsSync(`${dir}/OC/Drivers/${driver}`)) {
            filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/OpenCore/X64/EFI/OC/Drivers/${driver}`, `${dir}/OC/Drivers/${driver}`]);
        }
    }
    for (let driver of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Drivers`)) {
        if (fs.existsSync(`${dir}/OC/Drivers/${driver}`)) {
            filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Drivers/${driver}`, `${dir}/OC/Drivers/${driver}`]);
        }
    }
    for (let tool of fs.readdirSync(`${os.homedir()}/.oc-update/${PID}/OpenCore/X64/EFI/OC/Tools`)) {
        if (fs.existsSync(`${dir}/OC/Tools/${tool}`)) {
            filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/OpenCore/X64/EFI/OC/Tools/${tool}`, `${dir}/OC/Tools/${tool}`]);
        }
    }
    filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/OcBinaryData-master/OcBinaryData-master/Resources`, `${dir}/OC`]);
    if (kexts.includes('VirtualSMC.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VirtualSMC/Kexts/VirtualSMC.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('SMCProcessor.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VirtualSMC/Kexts/SMCProcessor.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('SMCSuperIO.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VirtualSMC/Kexts/SMCSuperIO.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('SMCBatteryManager.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VirtualSMC/Kexts/SMCBatteryManager.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('SMCLightSensor.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VirtualSMC/Kexts/SMCLightSensor.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('SMCDellSensors.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VirtualSMC/Kexts/SMCDellSensors.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('Lilu.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/Lilu/Lilu.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('WhateverGreen.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/WhateverGreen/WhateverGreen.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('AppleALC.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/AppleALC/AppleALC.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('AppleALCU.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/AppleALC/AppleALCU.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('VoodooPS2Controller.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VoodooPS2Controller/VoodooPS2Controller.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('VoodooI2C.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VoodooI2C/VoodooI2C.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('VoodooI2CHID.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VoodooI2C/VoodooI2CHID.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('VoodooI2CSynaptics.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VoodooI2C/VoodooI2CSynaptics.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('VoodooI2CELAN.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VoodooI2C/VoodooI2CELAN.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('VoodooI2CFTE.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VoodooI2C/VoodooI2CFTE.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('VoodooI2CAtmelMXT.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/VoodooI2C/VoodooI2CAtmelMXT.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('ECEnabler.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/ECEnabler/ECEnabler.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrightnessKeys.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrightnessKeys/BrightnessKeys.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('RealtekRTL8111.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/RealtekRTL8111/RealtekRTL8111-V${versions.RealtekRTL8111}/Release/RealtekRTL8111.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('AtherosE2200Ethernet.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/AtherosE2200Ethernet/AtherosE2200Ethernet-V${versions.AtherosE2200Ethernet}/Release/AtherosE2200Ethernet.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('USBInjectAll.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/RehabMan-USBInjectAll/Release/USBInjectAll.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('XHCI-unsupported.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/OS-X-USB-Inject-All-master/OS-X-USB-Inject-All-master/XHCI-unsupported.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('IntelMausi.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/IntelMausi/IntelMausi.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('NVMeFix.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/NVMeFix/NVMeFix.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('itlwm.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/itlwm/itlwm.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('AirportItlwm.kext')) {
        if (os.release().startsWith('23.')) filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/AirportItlwm/Sonoma14.${parseInt(os.release().split('.')[1]) >= 4 ? '4' : '0'}/AirportItlwm.kext`, `${dir}/OC/Kexts`]);
        else filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/AirportItlwm/AirportItlwm.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('IntelBluetoothFirmware.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware/IntelBluetoothFirmware.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('IntelBluetoothInjector.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware/IntelBluetoothInjector.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('IntelBTPatcher.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware/IntelBTPatcher.kext`, `${dir}/OC/Kexts`]);
    }
    // CpuTscSync.kext -> replace with CpuTscSync/CpuTscSync.kext
    if (kexts.includes('CpuTscSync.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/CpuTscSync/CpuTscSync.kext`, `${dir}/OC/Kexts`]);
    }
    // CPUFriend.kext -> replace with CPUFriend/CPUFriend.kext
    if (kexts.includes('CPUFriend.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/CPUFriend/CPUFriend.kext`, `${dir}/OC/Kexts`]);
    }
    // HibernationFixup.kext -> replace with HibernationFixup/HibernationFixup.kext
    if (kexts.includes('HibernationFixup.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/HibernationFixup/HibernationFixup.kext`, `${dir}/OC/Kexts`]);
    }
    // FeatureUnlock.kext -> replace with FeatureUnlock/FeatureUnlock.kext
    if (kexts.includes('FeatureUnlock.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/FeatureUnlock/FeatureUnlock.kext`, `${dir}/OC/Kexts`]);
    }
    // RestrictEvents.kext -> replace with RestrictEvents/RestrictEvents.kext
    if (kexts.includes('RestrictEvents.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/RestrictEvents/RestrictEvents.kext`, `${dir}/OC/Kexts`]);
    }
    // CpuTopologyRebuild.kext -> replace with CpuTopologyRebuild/CpuTopologyRebuild.kext
    if (kexts.includes('CpuTopologyRebuild.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/CpuTopologyRebuild/CpuTopologyRebuild.kext`, `${dir}/OC/Kexts`]);
    }
    // AirportBrcmFixup.kext -> replace with AirportBrcmFixup/AirportBrcmFixup.kext
    if (kexts.includes('AirportBrcmFixup.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/AirportBrcmFixup/AirportBrcmFixup.kext`, `${dir}/OC/Kexts`]);
    }
    /*
    if one of these kexts are installed: replace it with the appropriate kext in BrcmPatchRAM
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
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BlueToolFixup.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmBluetoothInjector.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmBluetoothInjector.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmBluetoothInjectorLegacy.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmBluetoothInjectorLegacy.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmFirmwareData.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmFirmwareData.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmFirmwareRepo.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmFirmwareRepo.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmNonPatchRAM.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmNonPatchRAM.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmNonPatchRAM2.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmNonPatchRAM2.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmPatchRAM.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmPatchRAM.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmPatchRAM2.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmPatchRAM2.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('BrcmPatchRAM3.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/BrcmPatchRAM/BrcmPatchRAM3.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('CtlnaAHCIPort.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/CtlnaAHCIPort/CtlnaAHCIPort.kext`, `${dir}/OC/Kexts`]);
    }
    // do the same for SATA-unsupported and AppleMCEReporterDisabler
    if (kexts.includes('SATA-unsupported.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/SATA-unsupported/SATA-unsupported.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes('AppleMCEReporterDisabler.kext')) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/AppleMCEReporterDisabler/AppleMCEReporterDisabler.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes("RealtekCardReader.kext")) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/RealtekCardReader/RealtekCardReader.kext`, `${dir}/OC/Kexts`]);
    }
    if (kexts.includes("RealtekCardReaderFriend.kext")) {
        filesToUpdate.push([`${os.homedir()}/.oc-update/${PID}/RealtekCardReaderFriend/RealtekCardReaderFriend.kext`, `${dir}/OC/Kexts`]);
    }
    window.webContents.send('fileprogress', ocver, kexts, PID, 0, filesToUpdate.length);
    await Promise.all(filesToUpdate.map(async (file) => {
        await cpexec(`cp -r ${file[0]} ${file[1]}`);
        fileCount++;
        window.webContents.send('fileprogress', ocver, kexts, PID, fileCount, filesToUpdate.length);
    }));
    evt.reply('updated-files', ocver, kexts, PID, backupDir);
});
electron.ipcMain.on('update-config-plist', async (evt, ocver, kexts, PID, efidir, backupDir) => {
    let ocverNum = parseInt(ocver.split('.').join(''));
    console.log(ocverNum);
    while (true) {
        if (ocverNum == versions.OpenCore[1]) break;
        console.log(updates[ocverNum.toString()]);
        console.log(PID);
        if (updates[ocverNum.toString()].configPlistChange) {
            if (fs.readdirSync(`${efidir}/OC`).includes('config.plist')) {
                await updates[ocverNum.toString()].exec(`${efidir}/OC/config.plist`, app, electron.ipcMain, window.webContents, PID);
            } else if (fs.readdirSync(`${efidir}/OC`).includes('Config.plist')) {
                await updates[ocverNum.toString()].exec(`${efidir}/OC/Config.plist`, app, electron.ipcMain, window.webContents, PID);
            }
        }
        ocverNum++;
    }
    const plistParsed: any = plist.parse(fs.readFileSync(`${efidir}/OC/${fs.existsSync(`${efidir}/OC/config.plist`) ? 'c' : 'C'}onfig.plist`, 'utf8'));
    if (plistParsed.Misc.Security.Vault != 'Optional') {
        plistParsed.Misc.Security.Vault = 'Optional';
        // build plistParsed, and write it back to file
        fs.writeFileSync(`${efidir}/OC/${fs.existsSync(`${efidir}/OC/config.plist`) ? 'c' : 'C'}onfig.plist`, plist.build(plistParsed));
        evt.reply('updated-config-plist', ocver, kexts, PID, true, backupDir);
        return;
    }
    evt.reply('updated-config-plist', ocver, kexts, PID, false, backupDir);
});
electron.ipcMain.on('finish', (evt, ocver, kexts, PID, efidir, vaultResult, backupDir) => {
    console.log(vaultResult);
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
    evt.reply('finished', ocver, kexts, PID, vaultResult, backupDir);
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