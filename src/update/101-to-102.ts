import fs from 'fs';
import plist from 'plist';
export default {
    from: 101,
    configPlistChange: true,
    exec: async (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 1.0.2
        create an empty array at UEFI - Unload
        */
        plistParsed.UEFI.Unload = [];
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}