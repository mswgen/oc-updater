// import plist, cp, os. path, and fs
import fs from 'fs';
import plist from 'plist';
import cp from 'child_process';
import os from 'os';
import path from 'path';
export default {
    from: 82,
    configPlistChange: true,
    exec: async (file: string, _app: any, _ipc: any, _webContents: any, PID: number) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.8.3
        move UEFI - Drivers [Path = OpenRuntime.efi] to index 0, and delete the previous OpenRuntime.efi
        if NVRAM - LegacyEnable is true:
            add to first of UEFI - Drivers:
                Arguments = (empty string)
                Comment = "Legacy NVRAM support"
                Enabled = true
                LoadEarly = true
                Path = OpenVariableRuntimeDxe.efi
            set UEFI - Drivers[1].LoadEarly to true
            set NVRAM - LegacySchema to { '36C28AB5-6566-4C50-9EBD-CBB920F83843': [ '*' ], '7C436110-AB2A-4BBB-A880-FE41995C9F82': [ '*' ], '8BE4DF61-93CA-11D2-AA0D-00E098032B8C': [ '*' ] }
        set Misc - Security - ExposeSensitiveData to 15
        divide UEFI - Audio - SetupDelay by 1000
        delete NVRAM - LegacyEnable
        */
       plistParsed.UEFI.Drivers.splice(0, 0, plistParsed.UEFI.Drivers.splice(plistParsed.UEFI.Drivers.findIndex((driver: any) => driver.Path === 'OpenRuntime.efi'), 1)[0]);
         if (plistParsed.NVRAM.LegacyEnable) {
            plistParsed.UEFI.Drivers.unshift({
                Arguments: '',
                Comment: 'Legacy NVRAM support',
                Enabled: true,
                LoadEarly: true,
                Path: 'OpenVariableRuntimeDxe.efi'
            });
            plistParsed.UEFI.Drivers[1].LoadEarly = true;
            plistParsed.NVRAM.LegacySchema = {
                '36C28AB5-6566-4C50-9EBD-CBB920F83843': [ '*' ],
                '7C436110-AB2A-4BBB-A880-FE41995C9F82': [ '*' ],
                '8BE4DF61-93CA-11D2-AA0D-00E098032B8C': [ '*' ]
            };
        }
        plistParsed.Misc.Security.ExposeSensitiveData = 15;
        plistParsed.UEFI.Audio.SetupDelay /= 1000;
        delete plistParsed.NVRAM.LegacyEnable;
        /*
            Intel Bluetooth: Add IntelBTPatcher.kext
        */
        if (plistParsed.Kernel.Add.some((x: any) => x.BundlePath == 'IntelBluetoothFirmware.kext') && !plistParsed.Kernel.Add.some((x: any) => x.BundlePath == 'IntelBTPatcher.kext')) {
            await fs.promises.cp(`${os.homedir()}/.oc-update/${PID}/IntelBluetoothFirmware/IntelBTPatcher.kext`, `${path.dirname(file)}/Kexts`, { recursive: true });
            plistParsed.Kernel.Add.push({
                Arch: 'Any',
                BundlePath: 'IntelBTPatcher.kext',
                Comment: '',
                Enabled: true,
                ExecutablePath: 'Contents/MacOS/IntelBTPatcher',
                MaxKernel: '',
                MinKernel: '',
                PlistPath: 'Contents/Info.plist'
            });
        }
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}