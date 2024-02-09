import plist from 'plist';
import fs from 'fs';
import type electron from 'electron';
export default {
    from: 65,
    configPlistChange: true,
    exec: (file: string, _app: any, ipc: electron.IpcMain, webContents: electron.WebContents, PID: number): Promise<null> => {
        return new Promise(resolve => {
            ipc.on('alert-closed', (_event: any, pid: number, version: number) => {
                if (version == 65 && pid == PID) {
                    const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
                    const ocDir = file.split('/').slice(0, -1).join('/');
                    if (fs.existsSync(`${ocDir}/Bootstrap`)) {
                        fs.rmSync(`${ocDir}/Bootstrap`, { recursive: true });
                        plistParsed.Misc.Boot.LauncherPath = 'Default';
                        plistParsed.Misc.Boot.LauncherOption = plistParsed.Misc.Security.BootProtect == 'BootstrapShort' ? 'Short' : (plistParsed.Misc.Security.BootProtect == 'Bootstrap' ? 'Full' : 'Disabled');
                        delete plistParsed.Misc.Security.BootProtect;
                    }
                    /*
                    create plist - Kernel - Quirks - SetApfsTrimTimeout = -1
                    create plist - PlatformInfo - UseRawUuidEncoding = false
                    create plist - PlatformInfo - Generic - MaxBIOSVersion = false
                    create plist - UEFI - Quirks = DisableSecurityPolicy = false
            
                    if plist - Misc - Tools (array, this always exists) has a child object with Path = HdaCodecDump.efi, remove it and add plist - Misc - Debug - SysReport = true, and force delete file ${ocDir}/Tools/HdaCodecDump.efi
            
                    if plist - UEFI - Audio - PlayChime is '', set it to Auto
                    do the same for plist - UEFI - Input - KeySupportMode
            
                    if plist - UEFI - Drivers (array of string) has VBoxHfs.efi, rename it to OpenHfsPlus.efi
                    */
                    plistParsed.Kernel.Quirks.SetApfsTrimTimeout = -1;
                    plistParsed.PlatformInfo.UseRawUuidEncoding = false;
                    plistParsed.PlatformInfo.Generic.MaxBIOSVersion = false;
                    plistParsed.UEFI.Quirks.DisableSecurityPolicy = false;
                    if (plistParsed.Misc.Tools.find((x: any) => x.Path == 'HdaCodecDump.efi')) {
                        plistParsed.Misc.Tools = plistParsed.Misc.Tools.filter((x: any) => x.Path != 'HdaCodecDump.efi');
                        plistParsed.Misc.Debug.SysReport = true;
                        fs.rmSync(`${ocDir}/Tools/HdaCodecDump.efi`, {
                            force: true
                        });
                    }
                    if (plistParsed.UEFI.Audio.PlayChime == '') {
                        plistParsed.UEFI.Audio.PlayChime = 'Auto';
                    }
                    if (plistParsed.UEFI.Input.KeySupportMode == '') {
                        plistParsed.UEFI.Input.KeySupportMode = 'Auto';
                    }
                    if (plistParsed.UEFI.Drivers.find((x: any) => x == 'VBoxHfs.efi')) {
                        plistParsed.UEFI.Drivers = plistParsed.UEFI.Drivers.map((x: any) => x == 'VBoxHfs.efi' ? 'OpenHfsPlus.efi' : x);
                    }
                    fs.writeFileSync(file, plist.build(plistParsed));
                    resolve(null);
                }
            });
            webContents.send('alert', PID, 65, `경고: Bootstrap.efi 감지됨
현재 Bootstrap.efi를 사용하고 있습니다. Bootstrap.efi는 0.6.6부터 LauncherOption으로 변경되었습니다.
업데이트하려면 Bootstrap.efi를 비활성화하고 NVRAM 초기화를 해야 합니다.
업데이트 후 재부팅 시 NVRAM 초기화를 진행해주세요.`, `Warning: Bootstrap.efi detected
You're using Bootstrap.efi. Bootstrap.efi was replaced by LauncherOption from 0.6.6.
To update, Bootstrap.efi must be disabled and NVRAM should be reset.
This can be done by resetting NVRAM on the first reboot after updating.`);
        });
    }
}
