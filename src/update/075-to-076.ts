// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 75,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        if Booter - Quirks - ResizeAppleGpuBars
        does not exist: create one with value -1
        if it exists and value is not -1, set it to 0

        set UEFI - Output - ReconnectGraphicsOnConnect to false

        remove NVRAM - Add - 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14 - UIScale

        set UEFI - Output - UIScale to 0
        set UEFI - Quirks - EnableVmx to false
        */
        if (!plistParsed.Booter.Quirks.ResizeAppleGpuBars) {
            plistParsed.Booter.Quirks.ResizeAppleGpuBars = -1;
        } else if (plistParsed.Booter.Quirks.ResizeAppleGpuBars != -1) {
            plistParsed.Booter.Quirks.ResizeAppleGpuBars = 0;
        }
        plistParsed.UEFI.Output.ReconnectGraphicsOnConnect ??= false;
        if (plistParsed.NVRAM.Add['4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14'].UIScale) delete plistParsed.NVRAM.Add['4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14'].UIScale;
        plistParsed.UEFI.Output.UIScale ??= 0;
        plistParsed.UEFI.Quirks.EnableVmx ??= false;
        // write plistParsed to ${file}
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}