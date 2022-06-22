// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 78,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        // set Misc-Debug-LogModules to *
        plistParsed.Misc.Debug.LogModules ??= '*';
        // for each dictionary in Kernel-Block:
        //   set Strategy to Disable
        plistParsed.Kernel.Block.forEach((x: any) => x.Strategy ??= 'Disable');
        // write plistParsed to ${file}
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}