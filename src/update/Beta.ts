// import plist, fs, os, and path
import fs from 'fs';
import plist from 'plist';
import os from 'os';
import path from 'path';
export default {
    from: 81,
    configPlistChange: true,
    exec: (file: string, PID: number) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        Changes of OpenCore 0.8.2 Beta:
        nothing now
        */
        // finally, write it back
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}