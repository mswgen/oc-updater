let efidir: string;
let ipc: any;
const isKorean = navigator.language.includes("ko");
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
    if (ocverNum < 98) {
        document.querySelector('#is-outdated')!.innerHTML = isKorean ? '구버전 OpenCore를 사용하고 있습니다.' : 'Your OpenCore is outdated.';
        document.querySelector<HTMLElement>('#update')!.style.display = 'block';
        ipc.on('downloaded-oc', async () => {
            document.querySelector('#progress')!.innerHTML = isKorean ? '2/7. kext 다운로드 중...' : '2/7. Downloading kexts...'
            await sleep(100);
            ipc.send('download-kexts', kexts);
        });
        ipc.on('downloaded-kexts', async () => {
            document.querySelector('#progress')!.innerHTML = isKorean ? '3/7. 바이너리 데이터 다운로드 중...' : '3/7. Downloading binary data...'
            await sleep(100);
            ipc.send('download-bindata');
        });
        ipc.on('downloaded-bindata', async () => {
            document.querySelector('#progress')!.innerHTML = isKorean ? '4/7. 백업 생성 중...' : '4/7. Creating backup...'
            await sleep(100);
            ipc.send('create-backup', efidir, ocver);
        });
        ipc.on('created-backup', async () => {
            document.querySelector('#progress')!.innerHTML = isKorean ? '5/7. 파일 변경 중...' : '5/7. Updating files...'
            await sleep(100);
            ipc.send('update-files', efidir, kexts);
        });
        ipc.on('updated-files', async () => {
            document.querySelector('#progress')!.innerHTML = isKorean ? '6/7. config.plist 수정 중... ' : '6/7. Updating config.plist...'
            await sleep(100);
            ipc.send('update-config-plist', efidir, ocverNum);
        });
        ipc.on('updated-config-plist', async (_e: any, vaultResult: boolean) => {
            document.querySelector('#progress')!.innerHTML = isKorean ? '7/7. 정리하는 중...' : '7/7. Cleaning up...'
            await sleep(100);
            ipc.send('finish', vaultResult, efidir);
        });
        ipc.on('finished', async (_e: any, vaultResult: boolean, backupLoc: string) => {
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
                'IntelBTPatcher.kext',
                'NVMeFix.kext',
                'CpuTscSync.kext',
                'CPUFriend.kext',
                'HibernationFixup.kext',
                'FeatureUnlock.kext',
                'RestrictEvents.kext',
                'CpuTopologyRebuild.kext',
                'AirportBrcmFixup.kext',
                'BlueToolFixup.kext',
                'BrcmBluetoothInjector.kext',
                'BrcmBluetoothInjectorLegacy.kext',
                'BrcmFirmwareData.kext',
                'BrcmFirmwareRepo.kext',
                'BrcmNonPatchRAM.kext',
                'BrcmNonPatchRAM2.kext',
                'BrcmPatchRAM.kext',
                'BrcmPatchRAM2.kext',
                'BrcmPatchRAM3.kext',
                'AtherosE2200Ethernet.kext',
                'USBInjectAll.kext',
                'XHCI-unsupported.kext',
                'CtlnaAHCIPort.kext',
                'SATA-unsupported.kext',
                'AppleMCEReporterDisabler.kext',
                'RealtekCardReader.kext',
                'RealtekCardReaderFriend.kext'
            ].includes(x)))
            if (kextsNotUpdated.length > 0) {
                document.querySelector('#kexts-not-updated')!.innerHTML = kextsNotUpdated.join('<br>');
            } else {
                document.querySelector<HTMLElement>('#kexts-not-updated-exists')!.style.display = 'none';
            }
            document.querySelector('#backup-location')!.innerHTML = backupLoc;
            if (vaultResult) {
                document.querySelector<HTMLElement>('#vault-removed')!.style.display = 'block';
            }
            document.querySelector<HTMLElement>('#update-in-progress')!.style.display = 'none';
            document.querySelector<HTMLElement>('#success')!.style.display = 'block';
        });
        document.querySelector('#update')?.addEventListener('click', async () => {
            document.querySelector<HTMLElement>('#efiinfo')!.style.display = 'none';
            document.querySelector<HTMLElement>('#update-in-progress')!.style.display = 'block';
            await sleep(50);
            ipc.send('download-oc');
        });
    }
}
window.addEventListener('load', async () => {
    ipc = (window as any).electron.ipcRenderer;
    ipc.on('alert', (_event: any, version: number, ko: string, en: string) => {
        alert(isKorean ? ko : en);
        ipc.send('alert-closed', version);
    });
    ipc.on('confirm', (_event: any, version: number, ko: string, en: string) => {
        const result = confirm(isKorean ? ko : en);
        ipc.send('confirm-reply', version, result);
    });
    document.querySelector('#start')!.addEventListener('click', async () => {
        const selectedDir = ipc.sendSync('select-efi-directory');
        if (selectedDir != 'cancel button pressed') {
            efidir = selectedDir;
            const validity = ipc.sendSync('check-efi-validity', efidir);
            if (validity == false) {
                return alert(isKorean ? '선택한 EFI가 유효하지 않습니다.' : 'Selected EFI is invalid.');
            }
            if (validity == '32bit') {
                return alert(isKorean ? '32비트는 지원되지 않습니다.' : '32-bit is not supported.');
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