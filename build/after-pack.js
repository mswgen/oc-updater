// electron macOS afterPack hook
// read Info.plist
// add CFBundleDocumentTypes
/*
<dict>
    <key>CFBundleTypeName</key>
    <string>Unknown document</string>
    <key>CFBundleTypeRole</key>
    <string>Viewer</string>
    <key>LSIsAppleDefaultForType</key>
    <true />
    <key>LSItemContentTypes</key>
    <array>
        <string>public.data</string>
    </array>
</dict>
*/
const fs = require('fs');
const plist = require('plist');
const path = require('path');
module.exports = context => {
    const { appOutDir } = context;
    const infoPlistPath = path.join(appOutDir, 'OpenCore Updater.app', 'Contents', 'Info.plist');
    const infoPlist = plist.parse(fs.readFileSync(infoPlistPath, 'utf8'));
    infoPlist.CFBundleDocumentTypes = [
        {
            CFBundleTypeName: 'Folder',
            CFBundleTypeRole: 'Editor',
            LSItemContentTypes: ['public.directory'],
            LSHandlerRank: 'None'
        },
    ];
    fs.writeFileSync(infoPlistPath, plist.build(infoPlist));
}