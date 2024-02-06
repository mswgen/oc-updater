// import plist and fs
import plist from 'plist';
import fs from 'fs';
export default {
    from: 64,
    configPlistChange: true,
    exec: async (file: string) => {
        // read ${file} plist, parse it, and assign to variable plistParsed
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        add plist - Misc - Boot - PickerVariant = Modern
        add plist - UEFI - Audio - SetupDelay = 0
        remove plist - UEFI - Quirks - DeduplicateBootOrder
        */
        plistParsed.Misc.Boot.PickerVariant = 'Modern';
        plistParsed.UEFI.Audio.SetupDelay = 0;
        delete plistParsed.UEFI.Quirks.DeduplicateBootOrder;
        // write plistParsed to ${file}
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}