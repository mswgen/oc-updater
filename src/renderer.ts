let efidir: string;
let ipc: any;
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function afterOcverSelection(ocver: string, efidir: string) {
    const kexts = ipc.sendSync('kextinfo', `${efidir}/OC/Kexts`);
            document.querySelector<HTMLElement>('#get-started')!.style.display = 'none';
            document.querySelector<HTMLElement>('#efiinfo')!.style.display = 'block';
            const ocverNum = Number(ocver.split('.').join(''));
            document.querySelector('#oc-version')!.innerHTML = ocver;
            document.querySelector('#using-kexts')!.innerHTML = kexts.join('<br>');
            if (ocverNum < 75) {
                document.querySelector('#is-outdated')!.innerHTML = 'Your OpenCore is outdated.';
                document.querySelector<HTMLElement>('#update')!.style.display = 'block';
                document.querySelector('#update')?.addEventListener('click', async () => {
                    if (ocverNum < 66) {
                        if (ipc.sendSync('check-bootstrap', efidir)) {
                            if (!confirm (`Warning: Bootstrap.efi detected
You're using Bootstrap.efi. Bootstrap.efi was replaced by LauncherOption from 0.6.6.
To update, Bootstrap.efi must be disabled and NVRAM should be reset.
To do this, open config.plist and
1. set Misc-Security-BootProtect to None
2. set Misc-Security-AllowNvramReset to true
3. reboot and select Reset NVRAM
4. reboot to macOS and run this app again
If you already did this, you may proceed, otherwise, you must quit this app, do the steps above, and re-run this app.
Do you want to contnue?`)) ipc.send('quit');
                        }
                    }
                    document.querySelector<HTMLElement>('#efiinfo')!.style.display = 'none';
                    document.querySelector<HTMLElement>('#update-in-progress')!.style.display = 'block';
                    await sleep(1000);
                    ipc.sendSync('download-oc');
                    document.querySelector('#progress')!.innerHTML = '2/7. Downloading kexts...'
                    await sleep(1000);
                    ipc.sendSync('download-kexts', kexts);
                    document.querySelector('#progress')!.innerHTML = '3/7. Downloading binary data...'
                    await sleep(1000);
                    ipc.sendSync('download-bindata');
                    document.querySelector('#progress')!.innerHTML = '4/7. Creating backup...'
                    await sleep(1000);
                    ipc.sendSync('create-backup', efidir);
                    document.querySelector('#progress')!.innerHTML = '5/7. Swapping files...'
                    await sleep(1000);
                    ipc.sendSync('swap-files', efidir, kexts);
                    document.querySelector('#progress')!.innerHTML = '6/7. Updating config.plist...'
                    await sleep(1000);
                    const vaultResult = ipc.sendSync('update-config-plist', efidir, ocverNum);
                    document.querySelector('#progress')!.innerHTML = '7/7. Cleaning up...'
                    await sleep(1000);
                    const backupLoc = ipc.sendSync('finish', efidir, ocverNum);
                    const kextsNotUpdated = kexts.filter((x: string) => !([
                        'VirtualSMC.kext',
                        'SMCProcessor.kext',
                        'SMCSuperIO.kext',
                        'SMCBatteryManager.kext',
                        'SMCLightSensor.kext',
                        'SMCDellSensors.kext',
                        'Lilu.kext',
                        'WhateverGreen.kext',
                        'AppleALC.kext',
                        'AppleALCU.kext',
                        'VoodooPS2Controller.kext',
                        'VoodooI2C.kext',
                        'VoodooI2CHID.kext',
                        'VoodooI2CSynaptics.kext',
                        'VoodooI2CELAN.kext',
                        'VoodooI2CFTE.kext',
                        'VoodooI2CAtmelMXT.kext',
                        'ECEnabler.kext',
                        'BrightnessKeys.kext',
                        'IntelMausi.kext',
                        'RealtekRTL8111.kext',
                        'itlwm.kext',
                        'AirportItlwm.kext',
                        'IntelBluetoothFirmware.kext',
                        'IntelBluetoothInjector.kext',
                        'NVMeFix.kext'
                    ].includes(x)))
                    if (kextsNotUpdated.length > 0) {
                        document.querySelector('#kexts-not-updated')!.innerHTML = kextsNotUpdated.join('<br>');
                    } else {
                        document.querySelector<HTMLElement>('#kexts-not-updated-exists')!.style.display = 'none';
                    }
                    document.querySelector('#backup-location')!.innerHTML = backupLoc;
                    if (vaultResult == 'vault-disabled') {
                        document.querySelector<HTMLElement>('#vault-removed')!.style.display = 'block';
                    }
                    document.querySelector<HTMLElement>('#update-in-progress')!.style.display = 'none';
                    document.querySelector<HTMLElement>('#success')!.style.display = 'block';
                });
            }
}
window.addEventListener('load', async () => {
    ipc = (window as any).electron.ipcRenderer;
    document.querySelector('#start')!.addEventListener('click', async () => {
        const selectedDir = ipc.sendSync('select-efi-directory');
        if (selectedDir != 'cancel button pressed') {
            efidir = selectedDir;
            const validity = ipc.sendSync('check-efi-validity', efidir);
            if (validity == false) {
                return alert('The selected EFI is not valid.');
            }
            if (validity == '32bit') {
                return alert('32-Bit is not supported.');
            }
            let ocver = ipc.sendSync('check-opencore-version', `${efidir}/OC/OpenCore.efi`);
            if (ocver == 'not-found') {
                document.querySelector<HTMLElement>('#get-started')!.style.display = 'none';
                document.querySelector<HTMLElement>('#select-opencore-version')!.style.display = 'block';
                document.querySelector<HTMLElement>('#confirm-version')!.addEventListener('click', () => {
                    document.querySelector<HTMLElement>('#select-opencore-version')!.style.display = 'none';
                    document.querySelector<HTMLElement>('#efiinfo')!.style.display = 'block';
                    ocver = document.querySelector<HTMLInputElement>('#oc-version-selection')!.value;
                    afterOcverSelection(ocver, efidir);
                });
            } else {
                document.querySelector<HTMLElement>('#get-started')!.style.display = 'none';
                document.querySelector<HTMLElement>('#efiinfo')!.style.display = 'block';
                afterOcverSelection(ocver, efidir);
            }
        }
    });
});