// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 93,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.9.4
        set Misc - Boot - InstanceIdentifier to empty string
        */
        plistParsed.Misc.Boot.InstanceIdentifier = '';
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}