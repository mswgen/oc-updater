import plist from 'plist';
import fs from 'fs';
export default {
    from: 67,
    configPlistChange: true,
    exec: (file: string) => {
        const plistFile: any = plist.parse(fs.readFileSync(file, 'utf8'));
        for (let i = 0; i < plistFile.ACPI.Patch.length; i++) {
            plistFile.ACPI.Patch[i].Base = '';
            plistFile.ACPI.Patch[i].BaseSkip = 0;
        }
        plistFile.Booter.Quirks.ForceBooterSignature = false;
        plistFile.UEFI.AppleInput = {
            AppleEvent: 'Builtin',
            CustomDelays: 'Auto',
            KeyInitialDelay: 0,
            KeySubsequentDelay: 5,
            PointerSpeedDiv: 1,
            PointerSpeedMul: 1
        }
        if (plistFile.Misc.Tools.find((tool: any) => tool.Path == 'VerifyMsrE2')) {
            plistFile.Misc.Tools[plistFile.Misc.Tools.findIndex((tool: any) => tool.Path == 'VerifyMsrE2')].Path = 'ControlMsrE2';
        }
        delete plistFile.UEFI.ProtocolOverrides.AppleEvent;
        fs.writeFileSync(file, plist.build(plistFile));
    }
}