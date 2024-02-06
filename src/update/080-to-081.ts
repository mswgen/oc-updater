// import plist, fs, os, and path
import fs from 'fs';
import plist from 'plist';
import os from 'os';
import path from 'path';
export default {
    from: 80,
    configPlistChange: true,
    exec: async (file: string, _app: any, _ipc: any, _webContents: any, PID: number) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.8.1:
        if Misc - Serial - Custom exists:
            create DetectCable below and set to false
        if Misc - Boot - TakeoffDelay is 0:
            set it to 750000
        copy $HOME/.oc-update/$PID/OpenCore/X64/EFI/OC/Drivers/ResetNvramEntry.efi to file's directory/Drivers/ asyncronously
        do the same for ToggleSipEntry.efi
        create a new dictionary at UEFI - Drivers(which is an array):
            set Arguments to (empty string)
            set Comment to Reset NVRAM
            set Enabled to Misc - Security - AllowNvramReset || false
            set Path to ResetNvramEntry.efi
        do the same with Path = ToggleSipEntry.efi
        finally, delete Misc - Security - AllowNvramReset and Misc - Security - AllowToggleSip
        */
        if (plistParsed.Misc.Serial.Custom) {
            plistParsed.Misc.Serial.DetectCable = false;
        }
        if (plistParsed.Misc.Boot.TakeoffDelay == 0) {
            plistParsed.Misc.Boot.TakeoffDelay = 750000;
        }
        fs.copyFileSync(path.join(os.homedir(), '.oc-update', PID.toString(), 'OpenCore', 'X64', 'EFI', 'OC', 'Drivers', 'ResetNvramEntry.efi'), path.join(path.dirname(file), 'Drivers', 'ResetNvramEntry.efi'));
        fs.copyFileSync(path.join(os.homedir(), '.oc-update', PID.toString(), 'OpenCore', 'X64', 'EFI', 'OC', 'Drivers', 'ToggleSipEntry.efi'), path.join(path.dirname(file), 'Drivers', 'ToggleSipEntry.efi'));
        plistParsed.UEFI.Drivers.push({
            Arguments: '',
            Comment: 'Reset NVRAM',
            Enabled: plistParsed.Misc.Security.AllowNvramReset || false,
            Path: 'ResetNvramEntry.efi'
        });
        plistParsed.UEFI.Drivers.push({
            Arguments: '',
            Comment: 'Toggle SIP',
            Enabled: plistParsed.Misc.Security.AllowToggleSip || false,
            Path: 'ToggleSipEntry.efi'
        });
        delete plistParsed.Misc.Security.AllowNvramReset;
        delete plistParsed.Misc.Security.AllowToggleSip;
        // finally, write it back
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}