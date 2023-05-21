// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 91,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.9.2
        set Kernel - Quirks - DisableIoMapperMapping to false
        set UEFI - Output - InitialMode to Auto
        */
        plistParsed.Kernel.Quirks.DisableIoMapperMapping = false;
        plistParsed.UEFI.Output.InitialMode = 'Auto';
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}