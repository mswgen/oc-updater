let efidir: string;
let ipc: any;
window.addEventListener('load', async () => {
    async function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
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
            const ocver = ipc.sendSync('check-opencore-version', `${efidir}/OC/OpenCore.efi`);
            if (ocver == 'not-found') {
                return alert('Unknown OpenCore Version. It might be DEBUG build or too old version. (0.6.8 and newer is supported)');
            }
            const kexts = ipc.sendSync('kextinfo', `${efidir}/OC/Kexts`);
            document.querySelector<HTMLElement>('#get-started')!.style.display = 'none';
            document.querySelector<HTMLElement>('#efiinfo')!.style.display = 'block';
            const ocverNum = Number(ocver.split('.').join(''));
            document.querySelector('#oc-version')!.innerHTML = ocver;
            document.querySelector('#using-kexts')!.innerHTML = kexts.join('<br>');
            if (ocverNum < 74) {
                document.querySelector('#is-outdated')!.innerHTML = 'Your OpenCore is outdated.';
                document.querySelector<HTMLElement>('#update')!.style.display = 'block';
                document.querySelector('#update')?.addEventListener('click', async () => {
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
                    ipc.sendSync('update-config-plist', efidir, ocverNum);
                    document.querySelector('#progress')!.innerHTML = '7/7. Cleaning up...'
                    await sleep(1000);
                    const backupLoc = ipc.sendSync('finish', efidir, ocverNum);
                    document.querySelector('#kexts-not-updated')!.innerHTML = kexts.filter((x: string) => !([
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
                    ].includes(x))).join('<br>');
                    document.querySelector('#backup-location')!.innerHTML = backupLoc;
                    document.querySelector<HTMLElement>('#update-in-progress')!.style.display = 'none';
                    document.querySelector<HTMLElement>('#success')!.style.display = 'block';
                });
            }
        }
    });
});