// import plist, cp, os. path, and fs
import fs from 'fs';
import plist from 'plist';
import cp from 'child_process';
import os from 'os';
import path from 'path';
export default {
    from: 83,
    configPlistChange: true,
    exec: async (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        // the 082 -> 083 update code of version 1.2.6 had a typo where Kernel - Add[BundlePath = IntelBTPatcher.kext] - Arch was any, not Any(note the capital A). fix this here
        if (plistParsed.Kernel.Add.some((x: any) => x.BundlePath == 'IntelBTPatcher.kext') && plistParsed.Kernel.Add.some((x: any) => x.Arch == 'any')) {
            plistParsed.Kernel.Add.find((x: any) => x.BundlePath == 'IntelBTPatcher.kext').Arch = 'Any';
        }
        /*
        // Changes of OpenCore 0.8.4
        
        */
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}