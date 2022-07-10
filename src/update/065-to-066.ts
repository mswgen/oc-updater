import plist from 'plist';
import fs from 'fs';
export default {
    from: 65,
    configPlistChange: true,
    exec: (file: string) => {
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        const ocDir = file.split('/').slice(0, -1).join('/');
        if (fs.existsSync(`${ocDir}/Bootstrap`)) {
            fs.rmdirSync(`${ocDir}/Bootstrap`, { recursive: true });
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
    }
}
