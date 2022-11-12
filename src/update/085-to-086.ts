// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 85,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.8.6
        set UEFI - AppleInput - PointerDwellClickTimeout to 0
        set UEFI - AppleInput - PointerDwellDoubleClickTimeout to 0
        set UEFI - AppleInput - PointerDwellRadius to 0
        */
        plistParsed.UEFI.AppleInput.PointerDwellClickTimeout = 0;
        plistParsed.UEFI.AppleInput.PointerDwellDoubleClickTimeout = 0;
        plistParsed.UEFI.AppleInput.PointerDwellRadius = 0;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}