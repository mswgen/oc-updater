import plist from 'plist';
import fs from 'fs';
import os from 'os';
export default {
    from: 71,
    configPlistChange: true,
    exec: (file: string) => {
        if (!fs.existsSync(file)) return;
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        if (Number(os.release().split('.')[0]) < 20) {
            plistParsed.UEFI.APFS.MinDate = -1;
            plistParsed.UEFI.APFS.MinVersion = -1;
        }
        plistParsed.UEFI.AppleInput.GraphicsInputMirroring = true;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}