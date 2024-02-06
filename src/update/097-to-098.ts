// import plist and fs
import fs from 'fs';
import plist from 'plist';
import os from 'os';
import path from 'path';
import type electron from 'electron';
export default {
    from: 97,
    configPlistChange: true,
    exec: (file: string, _app: any, ipc: electron.IpcMain, webContents: electron.WebContents, PID: number): Promise<null> => {
        return new Promise(resolve => {
            // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
            const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
            /*
            // Changes of OpenCore 0.9.8
            new Driver: FirmwareSettingsEntry.efi (confirm before adding)
            */
            ipc.on('confirm-reply', (_event: any, version: number, confirm: boolean) => {
                if (version == 97) {
                    if (confirm) {
                        // 1. add file
                        fs.copyFileSync(path.join(os.homedir(), '.oc-update', PID.toString(), 'OpenCore', 'X64', 'EFI', 'OC', 'Drivers', 'FirmwareSettingsEntry.efi'), path.join(path.dirname(file), 'Drivers', 'FirmwareSettingsEntry.efi'));
                        // 2. add to plist
                        /*
                        <dict>
                            <key>Arguments</key>
                            <string></string>
                            <key>Comment</key>
                            <string></string>
                            <key>Enabled</key>
                            <true/>
                            <key>LoadEarly</key>
                            <false/>
                            <key>Path</key>
                            <string>FirmwareSettingsEntry.efi</string>
                        </dict>
                        */
                        plistParsed.UEFI.Drivers.push({
                            Arguments: '',
                            Comment: '',
                            Enabled: true,
                            LoadEarly: false,
                            Path: 'FirmwareSettingsEntry.efi'
                        });
                    }
                    fs.writeFileSync(file, plist.build(plistParsed));
                    resolve(null);
                }
            });
            webContents.send('confirm', 97, `OpenCore 0.9.8에서 새로운 드라이버인 FirmwareSettingsEntry.efi가 추가되었습니다.
이 드라이버는 OpenCore 부팅 화면에 UEFI 설정 진입을 위한 메뉴를 추가합니다.
이 드라이버를 추가하시겠습니까?`, `A new driver, FirmwareSettingsEntry.efi, has been added in OpenCore 0.9.8.
This driver adds a menu to enter UEFI settings to the OpenCore boot screen.
Do you want to add this driver?`);
        });
    }
}