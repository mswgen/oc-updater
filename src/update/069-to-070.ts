import plist from 'plist';
import fs from 'fs';
export default {
    from: 69,
    configPlistChange: true,
    exec: (file: string) => {
        if (!fs.existsSync(file)) return;
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        plistParsed.Kernel.Quirks.ProvideCurrentCpuInfo = false;
        plistParsed.Misc.Security.AllowToggleSip = false;
        let cnt = 0;
        for (let entry of plistParsed.Misc.Entries) {
            plistParsed.Misc.Entries[cnt].Flavour = 'Auto';
            cnt++;
        }
        let cnt2 = 0;
        for (let tool of plistParsed.Misc.Tools) {
            plistParsed.Misc.Tools[cnt].Flavour = 'Auto';
            cnt2++;
        }
        plistParsed.NVRAM.Add['7C436110-AB2A-4BBB-A880-FE41995C9F82'].ForceDisplayRotationInEFI = 0;
        plistParsed.PlatformInfo.Generic.AdviseFeatures = plistParsed.PlatformInfo.Generic.AdviseWindows ? true : false;
        delete plistParsed.PlatformInfo.Generic.AdviseWindows;
        plistParsed.UEFI.Output.GopPassThrough = plistParsed.UEFI.Output.GopPassThrough == true ? 'Enabled' : 'Disabled';
        plistParsed.UEFI.ProtocolOverrides.AppleEg2Info = false;
        switch (plistParsed.Misc.Boot.PickerVariant) {
            case 'Auto':
                plistParsed.Misc.Boot.PickerVariant = 'Auto';
                break;
            case 'Modern':
                plistParsed.Misc.Boot.PickerVariant = 'Acidanthera\\GoldenGate';
                break;
            case 'Default':
                plistParsed.Misc.Boot.PickerVariant = 'Acidanthera\\Syrah';
                break;
            case 'Old':
                plistParsed.Misc.Boot.PickerVariant = 'Acidanthera\\Chardonnay';
                break;
        }
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}