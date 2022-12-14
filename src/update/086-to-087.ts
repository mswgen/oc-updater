// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 86,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.8.7
        set Misc - Boot - HibernateSkipsPicker to false
        */
        plistParsed.Misc.Boot.HibernateSkipsPicker = false;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}