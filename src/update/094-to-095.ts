// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 94,
    configPlistChange: true,
    exec: async (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.9.5
        set UEFI - Quirks - ShimRetainProtocol to false
        */
        plistParsed.UEFI.Quirks.ShimRetainProtocol = false;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}