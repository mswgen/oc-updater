// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 90,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.9.1
        set UEFI - Output - GopBurstMode to false
        */
        plistParsed.UEFI.Output.GopBurstMode = false;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}