// import plist and fs
import plist from 'plist';
import fs from 'fs';
export default {
    from: 63,
    configPlistChange: true,
    exec: async (file: string) => {
        // read ${file}, parse plist and store as plistParsed
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        create plist - Booter - Patch as an empty array
        set plist - Booter - Quirks - AllowRelocationBlock to false
        set plist - Misc - Security - BlacklistAppleUpdate to true
        for each dictionary in plist - Misc - Tools (array),
        1, set RealPath to false
        2. set TextMode to false

        for each dictionary in plist - Misc - Entries (array), set TextMode to false

        if plist - UEFI - Audio - PlayChime is
        1. true: set it to Enabled
        2. false: set it to Disabled
        */
        plistParsed.Booter.Patch = [];
        plistParsed.Booter.Quirks.AllowRelocationBlock = false;
        plistParsed.Misc.Security.BlacklistAppleUpdate = true;
        plistParsed.Misc.Tools.forEach((tool: any) => {
            tool.RealPath = false;
            tool.TextMode = false;
        });
        plistParsed.Misc.Entries.forEach((entry: any) => {
            entry.TextMode = false;
        });
        if (plistParsed.UEFI.Audio.PlayChime === true) {
            plistParsed.UEFI.Audio.PlayChime = 'Enabled';
        } else {
            plistParsed.UEFI.Audio.PlayChime = 'Disabled';
        }
        // write plistParsed to ${file}
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}