import plist from 'plist';
import fs from 'fs';
export default {
    from: 67,
    configPlistChange: true,
    exec: (file: string) => {
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        for (let i = 0; i < plistParsed.ACPI.Patch.length; i++) {
            plistParsed.ACPI.Patch[i].Base = '';
            plistParsed.ACPI.Patch[i].BaseSkip = 0;
        }
        plistParsed.Booter.Quirks.ForceBooterSignature = false;
        plistParsed.UEFI.AppleInput = {
            AppleEvent: 'Builtin',
            CustomDelays: 'Auto',
            KeyInitialDelay: 0,
            KeySubsequentDelay: 5,
            PointerSpeedDiv: 1,
            PointerSpeedMul: 1
        }
        if (plistParsed.Misc.Tools.find((tool: any) => tool.Path == 'VerifyMsrE2')) {
            plistParsed.Misc.Tools[plistParsed.Misc.Tools.findIndex((tool: any) => tool.Path == 'VerifyMsrE2')].Path = 'ControlMsrE2';
        }
        delete plistParsed.UEFI.ProtocolOverrides.AppleEvent;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}