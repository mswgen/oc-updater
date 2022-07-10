import plist from 'plist';
import fs from 'fs';
export default {
    from: 68,
    configPlistChange: true,
    exec: (file: string) => {
        if (!fs.existsSync(file)) return;
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        plistParsed.UEFI.AppleInput.CustomDelays = false;
        plistParsed.UEFI.AppleInput.KeyInitialDelay = 50;
        plistParsed.UEFI.AppleInput.KeySubsequentDelay = 5;
        plistParsed.UEFI.AppleInput.PointerSpeedMul = 1;
        delete plistParsed.UEFI.ProtocolOverrides.AppleEventType;
        plistParsed.UEFI.Quirks.EnableVectorAcceleration = false;
        plistParsed.UEFI.Quirks.ForgeUefiSupport = false;
        plistParsed.UEFI.Quirks.ReloadOptionRoms = false;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}