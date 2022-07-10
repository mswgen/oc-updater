// import plist and fs
import plist from 'plist';
import fs from 'fs';
export default {
    /*
    from | number | 74
    configPlistChange | boolean | true
    exec | function | (file: string) => void
    */
    from: 74,
    configPlistChange: true,
    exec: (file: string) => {
        // read plist {file} as type any and parse, then store as plistParsed
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        set Booter - Quirks - ResizeAppleGpuBars to -1
        set UEFI - Quirks - ResizeGpuBars to -1
        */
        plistParsed.Booter.Quirks.ResizeAppleGpuBars = -1;
        plistParsed.UEFI.Quirks.ResizeGpuBars = -1;
        // write plistParsed to {file}
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}