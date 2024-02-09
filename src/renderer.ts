let efidir: {[key: string]: string} = {};
let ipc: any;
let initDir: string | null;
const supportedKexts = [
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
];
const isKorean = navigator.language.includes("ko");
async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
window.addEventListener('load', async () => {
    ipc = (window as any).electron.ipcRenderer;
    ipc.on('alert', (_event: any, PID: number, version: number, ko: string, en: string) => {
        alert(isKorean ? ko : en);
        ipc.send('alert-closed', PID, version);
    });
    ipc.on('confirm', (_event: any, PID: number, version: number, ko: string, en: string) => {
        const result = confirm(isKorean ? ko : en);
        ipc.send('confirm-reply', PID, version, result);
    });
    ipc.on('theme', (_event: any, isDark: boolean) => {
        if (isDark) {
            document.querySelector('body')!.style.backgroundColor = '#332f2f';
            document.querySelector('body')!.style.color = '#dfdfdf';
        } else {
            document.querySelector('body')!.style.backgroundColor = '#f1efee';
            document.querySelector('body')!.style.color = '#242424';
        }
    });
    ipc.on('downloaded-oc', async (_event: any, ocver: string, kexts: Array<string>, PID: number) => {
        document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`)!.innerHTML = isKorean ? `2/7. kext <span class="kextprogress">0/0</span>개 다운로드 중...` : `2/7. Downloading <span class="kextprogress">0/0</span> kexts...`
        await sleep(100);
        ipc.send('download-kexts', ocver, kexts, PID);
    });
    ipc.on('kextprogress', (_e: any, ocver: string, kexts: Array<string>, PID: number, progress: number, total: number) => {
        (document.querySelector(`.card[data-pid="${PID}"] .kextprogress`) || { innerHTML: '' }).innerHTML = progress.toString() + '/' + total.toString();
    });
    ipc.on('downloaded-kexts', async (_event: any, ocver: string, kexts: Array<string>, PID: number) => {
        document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`)!.innerHTML = isKorean ? '3/7. 바이너리 데이터 다운로드 중...' : '3/7. Downloading binary data...'
        await sleep(100);
        ipc.send('download-bindata', ocver, kexts, PID);
    });
    ipc.on('downloaded-bindata', async (_event: any, ocver: string, kexts: Array<string>, PID: number) => {
        document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`)!.innerHTML = isKorean ? '4/7. 백업 생성 중...' : '4/7. Creating backup...'
        await sleep(100);
        ipc.send('create-backup', ocver, kexts, PID, efidir[PID]);
    });
    ipc.on('created-backup', async (_event: any, ocver: string, kexts: Array<string>, PID: number, backupDir: string) => {
        document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`)!.innerHTML = isKorean ? `5/7. 파일 <span class="fileprogress">0/0</span>개 변경 중...` : `5/7. Updating <span class="fileprogress">0/0</span> files...`
        await sleep(100);
        ipc.send('update-files', ocver, kexts, PID, efidir[PID], backupDir);
    });
    ipc.on('fileprogress', (_e: any, ocver: string, kexts: Array<string>, PID: number, progress: number, total: number) => {
        (document.querySelector(`.card[data-pid="${PID}"] .fileprogress`) || { innerHTML: '' }).innerHTML = progress.toString() + '/' + total.toString();
    });
    ipc.on('updated-files', async (_event: any, ocver: string, kexts: Array<string>, PID: number, backupDir: string) => {
        document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`)!.innerHTML = isKorean ? '6/7. config.plist 수정 중... ' : '6/7. Updating config.plist...'
        await sleep(100);
        ipc.send('update-config-plist', ocver, kexts, PID, efidir[PID], backupDir);
    });
    ipc.on('updated-config-plist', async (_event: any, ocver: string, kexts: Array<string>, PID: number, vaultResult: boolean, backupDir: string) => {
        document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`)!.innerHTML = isKorean ? '7/7. 정리하는 중...' : '7/7. Cleaning up...'
        await sleep(100);
        ipc.send('finish', ocver, kexts, PID, efidir[PID], vaultResult, backupDir);
    });
    ipc.on('finished', async (_event: any, ocver: string, kexts: Array<string>, PID: number, vaultResult: boolean, backupLoc: string) => {
        document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`)!.innerHTML = isKorean ? '완료' : 'Finished';
        const kextsNotUpdated = kexts.filter((x: string) => !(supportedKexts.includes(x)))
        if (kextsNotUpdated.length > 0) {
            (document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`) as HTMLElement).dataset.notUpdatedKexts = kextsNotUpdated.join(';');
        }
        (document.querySelector(`.card[data-pid="${PID}"]`) as HTMLElement).outerHTML = (document.querySelector(`.card[data-pid="${PID}"]`) as HTMLElement).outerHTML;
        const viewBackupBtn = document.querySelector(`.card[data-pid="${PID}"] .update-btn`) as HTMLButtonElement;
        viewBackupBtn.innerHTML = isKorean ? '백업 폴더 열기' : 'Open Backup Folder';
        viewBackupBtn.addEventListener('click', async () => {
            ipc.send('open-folder', backupLoc);
        });
        viewBackupBtn.disabled = false;
        if (vaultResult) {
            (document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`) as HTMLElement).dataset.vault = 'disabled';
        }
        const ocInfoDesc = document.querySelector(`.card[data-pid="${PID}"] .oc-info-desc`) as HTMLDivElement;
        console.log(ocInfoDesc.dataset.nonExistingValue);
        if (ocInfoDesc.dataset.notUpdatedKexts || ocInfoDesc.dataset.vault) {
            const alertContent = `${ocInfoDesc.dataset.notUpdatedKexts ? (isKorean ? '지원되지 않는 kext:\n' : 'Unsupported kexts:\n') + ocInfoDesc.dataset.notUpdatedKexts.split(';').join('\n') + (ocInfoDesc.dataset.vault ? '\n\n' : '') : ''}${ocInfoDesc.dataset.vault ? (isKorean ? 'OpenCore Vault가 비활성화되었습니다. Vault를 사용하려면 재설정이 필요합니다.' : 'OpenCore Vault is disabled. Please manually enable Vault if you want to use it.') : ''}`;
            ocInfoDesc.innerHTML = isKorean ? '완료(클릭해서 자세한 정보 확인)' : 'Finished (click for more info)';
            ocInfoDesc.style.cursor = 'pointer';
            ocInfoDesc.addEventListener('click', () => {
                alert(alertContent);
            });
        }
    });
    ipc.send('get-theme');
    document.querySelector('#start')!.addEventListener('click', async () => {
        const selectedDir = initDir || ipc.sendSync('select-efi-directory');
        initDir = null;
        if (selectedDir != 'cancel button pressed') {
            if (Object.keys(efidir).some(key => efidir[key] == selectedDir)) return alert(isKorean ? '이미 추가된 EFI입니다.' : 'This EFI is already added.');
            document.querySelector<HTMLButtonElement>('#open-efi')!.style.display = 'inline-block';
            const pid = Math.floor(Math.random() * 1000000);
            efidir[pid] = selectedDir;
            const validity = ipc.sendSync('check-efi-validity', efidir[pid]);
            if (validity == false) {
                return alert(isKorean ? '선택한 EFI가 유효하지 않습니다.' + (initDir ? ' 볼륨이 마운트되어 있는지 확인하세요.' : '') : 'Selected EFI is invalid.' + (initDir ? ' Make sure the volume is mounted.' : ''));
            }
            if (validity == '32bit') {
                return alert(isKorean ? '32비트는 지원되지 않습니다.' : '32-bit is not supported.');
            }
            let ocver = ipc.sendSync('check-opencore-version', `${efidir[pid]}/OC/OpenCore.efi`);
            const kexts = ipc.sendSync('kextinfo', `${efidir[pid]}/OC/Kexts`);
            document.querySelector<HTMLElement>('#get-started')!.style.display = 'none';
            const ocverNum = Number((ocver || '0').split('.').join(''));
            const card: HTMLDivElement = document.createElement('div');
            card.className = 'card';
            const ocImg = document.createElement('img');
            ocImg.src = 'opencore.svg';
            ocImg.alt = 'OpenCore';
            card.appendChild(ocImg);
            const ocInfo = document.createElement('div');
            const ocInfoTitle = document.createElement('div');
            ocInfoTitle.className = 'oc-info-title';
            if (ocver) ocInfoTitle.innerHTML = `OpenCore ${ocver}`;
            else {
                ocInfoTitle.innerHTML = 'OpenCore';
                ocInfoTitle.style.display = 'grid';
                ocInfoTitle.style.gridTemplateColumns = 'auto auto 1fr';
                const ocVersionSelector = document.createElement('select');
                ocVersionSelector.className = 'version-selector';
                for (let i = 63; i < ipc.sendSync('get-latest')[1]; i++) {
                    const option = document.createElement('option');
                    option.value = i.toString().padStart(3, '0').split('').join('.');
                    option.text = i.toString().padStart(3, '0').split('').join('.');
                    ocVersionSelector.appendChild(option);
                }
                (ocVersionSelector.children[ocVersionSelector.children.length - 1] as HTMLOptionElement).selected = true;
                ocVersionSelector.style.marginLeft = '10px';
                ocInfoTitle.appendChild(ocVersionSelector);
                ocInfoTitle.appendChild(document.createElement('div'));
            }
            ocInfo.appendChild(ocInfoTitle);
            const ocInfoDesc = document.createElement('div');
            ocInfoDesc.className = 'oc-info-desc';
            if (!ocver) ocInfoDesc.innerHTML = isKorean ? '64비트 RELEASE 버전이 지원됨' : '64-bit RELEASE versions are supported';
            else ocInfoDesc.innerHTML = ocverNum < 98 ? (isKorean ? '0.9.8로 업데이트하기' : 'Update to 0.9.8') : (isKorean ? '최신 버전' : 'Up to date');
            ocInfo.appendChild(ocInfoDesc);
            card.appendChild(ocInfo);
            card.appendChild(document.createElement('div'));
            if (ocverNum < ipc.sendSync('get-latest')[1]) {
                const ocInfoUpdate = document.createElement('button');
                ocInfoUpdate.innerHTML = isKorean ? '업데이트' : 'Update';
                ocInfoUpdate.className = 'update-btn';
                card.dataset.pid = pid.toString();
                ocInfoUpdate.style.position = 'relative';
                ocInfoUpdate.style.top = '50%';
                ocInfoUpdate.style.right = '10px';
                ocInfoUpdate.style.transform = 'translateY(-50%)';
                ocInfoUpdate.style.height = '50%';
                ocInfoUpdate.addEventListener('click', async () => {
                    (document.querySelector(`.card[data-pid="${pid}"] .update-btn`) as HTMLButtonElement).disabled = true;
                    ocver = ocver || (document.querySelector(`.card[data-pid="${pid}"] .version-selector`) as HTMLSelectElement).value;
                    document.querySelector(`.card[data-pid="${pid}"] .oc-info-title`)!.innerHTML = `OpenCore ${ocver}`;
                    (document.querySelector(`.card[data-pid="${pid}"] .oc-info-title`) as HTMLElement).style.display = 'block';
                    document.querySelector(`.card[data-pid="${pid}"] .oc-info-desc`)!.innerHTML = isKorean ? `1/7. OpenCore 다운로드 중...` : `1/7. Downloading OpenCore...`
                    await sleep(50);
                    ipc.send('download-oc', ocver, kexts, pid);
                });
                card.appendChild(ocInfoUpdate);
            }
            document.querySelector<HTMLDivElement>('#update-list')!.appendChild(card);
        }
    });
    ipc.on('init-dir', (_event: any, dir: string) => {
        initDir = dir;
        (document.querySelector('#start') as HTMLButtonElement).click();
    });
    document.querySelector('#open-efi')!.addEventListener('click', () => {
        document.querySelector<HTMLButtonElement>('#start')!.click();
    });
});