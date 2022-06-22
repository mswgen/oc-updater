// import plist and fs
import fs from 'fs';
import plist from 'plist';
export default {
    from: 76,
    configPlistChange: true,
    exec: (file: string) => {
        // read ${file} as utf8, parse it as plist, and save it to variable `plistParsed`
        const plistParsed: any = plist.parse(fs.readFileSync(file, 'utf8'));
        /*
        set NVRAM - Add - 7C436110-AB2A-4BBB-A880-FE41995C9F82 - SystemAudioVolumeDB to <Buffer 00>

        set UEFI - AppleInput - PointerPollMin to 10
        set UEFI - AppleInput - PointerPollMax to 80
        set UEFI - AppleInput - PointerPollMask to -1

        set UEFI - Audio - AudioOutMask to -1
        set UEFI - Audio - DisconnectHda to false
        set UEFI - Audio - MaximumGain to -15
        set UEFI - Audio - MinimumAssistGain to -30
        set UEFI - Audio - MinimumAudibleGain to -55
        remove UEFI - Audio - AudioOut
        remove UEFI - Audio - MinimumVolume
        remove UEFI - Audio - VolumeAmplifier
        */
        plistParsed.NVRAM.Add['7C436110-AB2A-4BBB-A880-FE41995C9F82'].SystemAudioVolumeDB ??= Buffer.from([0x00]);
        plistParsed.UEFI.AppleInput.PointerPollMin ??= 10;
        plistParsed.UEFI.AppleInput.PointerPollMax ??= 80;
        plistParsed.UEFI.AppleInput.PointerPollMask ??= -1;
        plistParsed.UEFI.Audio.AudioOutMask ??= -1;
        plistParsed.UEFI.Audio.DisconnectHda ??= false;
        plistParsed.UEFI.Audio.MaximumGain ??= -15;
        plistParsed.UEFI.Audio.MinimumAssistGain ??= -30;
        plistParsed.UEFI.Audio.MinimumAudibleGain ??= -55;
        if (plistParsed.UEFI.Audio.AudioOut) delete plistParsed.UEFI.Audio.AudioOut;
        if (plistParsed.UEFI.Audio.MinimumVolume) delete plistParsed.UEFI.Audio.MinimumVolume;
        if (plistParsed.UEFI.Audio.VolumeAmplifier) delete plistParsed.UEFI.Audio.VolumeAmplifier;
        // write plistParsed to ${file}
        fs.writeFileSync(file, plist.build(plistParsed));
    }
}