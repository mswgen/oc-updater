import plist from 'plist';
import fs from 'fs';
export default {
    from: 72,
    configPlistChange: true,
    exec: async (file: string) => {
        if (!fs.existsSync(file)) return;
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        plistParsed.UEFI.Quirks.ForceOcWriteFlash = false;
        let cnt = 0;
        for (let driver of plistParsed.UEFI.Drivers) {
            plistParsed.UEFI.Drivers[cnt] = {
                Arguments: '',
                Enabled: true,
                Path: driver
            }
            cnt++;
        }
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}