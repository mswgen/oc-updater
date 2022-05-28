// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 79,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        // Changes of OpenCore 0.8.0:
        set Kernel - Quirks - CustomPciSerialDevice to false
        set Kernel - Quirks - ForceAquantiaEthernet to false
        create a new dictionary at Misc - Serial
        inside it, set Override to false
        set Init to Misc - Debug - SerialInit value
        finally, delete Misc - Debug - SerialInit
        */
        plistParsed.Kernel.Quirks.CustomPciSerialDevice = false;
        plistParsed.Kernel.Quirks.ForceAquantiaEthernet = false;
        plistParsed.Misc.Serial = {
            Override: false,
            Init: plistParsed.Misc.Debug.SerialInit
        };
        delete plistParsed.Misc.Debug.SerialInit;
        // finally, write it back
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}