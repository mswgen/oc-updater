// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 92,
    configPlistChange: true,
    exec: async (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.9.3
        set UEFI - Output - ConsoleFont to empty string
        set UEFI - ProtocolOverrides - PciIo to false
        */
        plistParsed.UEFI.Output.ConsoleMode = '';
        plistParsed.UEFI.ProtocolOverrides.PciIo = false;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}