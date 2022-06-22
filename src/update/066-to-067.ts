import plist from 'plist';
import fs from 'fs';
export default {
    from: 66,
    configPlistChange: true,
    exec: (file: string) => {
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        let cnt = 0;
        if ('Patch' in plistParsed.Booter) {
            for (let booterPatch of plistParsed.Booter.Patch) {
                if (booterPatch.Identifier && booterPatch.Identifier == '') {
                    plistParsed.Booter.Patch[cnt].Identifier = 'Any';
                }
                cnt++;
            }
        }
        plistParsed.UEFI.Audio.ResetTrafficClass ??= false;
        if (plistParsed.UEFI.Input.KeyMergeThreshold) delete plistParsed.UEFI.Input.KeyMergeThreshold;
        plistParsed.UEFI.Output.GopPassThrough ??= false;
        plistParsed.UEFI.Quirks.ActivateHpetSupport ??= false;
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}