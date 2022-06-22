// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 77,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        // remove NVRAM - Add - 7C436110-AB2A-4BBB-A880-FE41995C9F82 - SystemAudioVolumeDB
        if (plistParsed.NVRAM.Add['7C436110-AB2A-4BBB-A880-FE41995C9F82'].SystemAudioVolumeDB) delete plistParsed.NVRAM.Add['7C436110-AB2A-4BBB-A880-FE41995C9F82'].SystemAudioVolumeDB;
        // write plistParsed to ${file}
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}