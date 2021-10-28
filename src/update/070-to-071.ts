import plist from 'plist';
import fs from 'fs';
export default {
    from: 70,
    configPlistChange: true,
    exec: (file: string) => {
        if (!fs.existsSync(file)) return;
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        plistParsed.ACPI.Quirks.SyncTableIds = false;
        plistParsed.Kernel.Scheme.CustomKernel = false;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}