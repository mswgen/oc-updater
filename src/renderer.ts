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
    if (ocverNum < 82) {
        document.querySelector('#is-outdated')!.innerHTML = isKorean ? '구버전 OpenCore를 사용하고 있어요.' : 'Your OpenCore is outdated.';
        document.querySelector<HTMLElement>('#update')!.style.display = 'block';
        document.querySelector('#update')?.addEventListener('click', async () => {
            if (ocverNum < 66) {
                if (ipc.sendSync('check-bootstrap', efidir)) {
                    if (!confirm(isKorean ? `경고: Bootstrap.efi 감지됨
현재 Bootstrap.efi를 사용하고 있습니다. Bootstrap.efi는 0.6.6부터 LauncherOption으로 변경되었습니다.
업데이트하려면 Bootstrap.efi를 비활성화하고 NVRAM 초기화를 해야 합니다.
config.plist를 열고
1. Misc-Security-BootProtect를 None으로 변경해주세요.
2. Misc-Security-AllowNvramReset을 True로 설정해주세요.
3. 재부팅하고 Reset NVRAM을 선택해주세요.
4. macOS로 재부팅하고 이 앱을 다시 실행해주세요.
이 작업을 이미 했다면 계속 진행해도 됩니다. 이 작업을 하지 않았다면, 이 앱을 닫고, 작업을 진행한 다음 앱을 다시 실행해주세요.
계속 진행할까요?` : `Warning: Bootstrap.efi detected
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
            document.querySelector('#progress')!.innerHTML = isKorean ? '2/7. kext 다운로드 중...' : '2/7. Downloading kexts...'
            await sleep(1000);
            ipc.sendSync('download-kexts', kexts);
            document.querySelector('#progress')!.innerHTML = isKorean ? '3/7. 바이너리 데이터 다운로드 중...' : '3/7. Downloading binary data...'
            await sleep(1000);
            ipc.sendSync('download-bindata');
            document.querySelector('#progress')!.innerHTML = isKorean ? '4/7. 백업 생성 중...' : '4/7. Creating backup...'
            await sleep(1000);
            ipc.sendSync('create-backup', efidir);
            document.querySelector('#progress')!.innerHTML = isKorean ? '5/7. 파일 변경 중...' : '5/7. Swapping files...'
            await sleep(1000);
            ipc.sendSync('swap-files', efidir, kexts);
            document.querySelector('#progress')!.innerHTML = isKorean ? '6/7. config.plist 수정 중... ' : '6/7. Updating config.plist...'
            await sleep(1000);
            const vaultResult = ipc.sendSync('update-config-plist', efidir, ocverNum);
            document.querySelector('#progress')!.innerHTML = isKorean ? '7/7. 정리하는 중...' : '7/7. Cleaning up...'
            await sleep(1000);
            const backupLoc = ipc.sendSync('finish', efidir);
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
                'NVMeFix.kext',
                'CpuTscSync.kext',
                'CPUFriend.kext',
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
                return alert(isKorean ? '선택한 EFI가 유효하지 않아요.' : 'Selected EFI is invalid.');
            }
            if (validity == '32bit') {
                return alert(isKorean ? '32비트는 지원되지 않아요.' : '32-bit is not supported.');
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