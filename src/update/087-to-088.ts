// import path and fs
import fs from 'fs';
import path from 'path';
export default {
    from: 87,
    configPlistChange: true, // no change actually, only for .contentVisibility file
    exec: async (file: string) => {
        // Create ../BOOT/.contentVisibility with content "Disabled"
        // same with .contentVisibility
        fs.writeFileSync(path.join(path.dirname(file), '..', 'BOOT', '.contentVisibility'), 'Disabled');
        fs.writeFileSync(path.join(path.dirname(file), '.contentVisibility'), 'Disabled');
    }
}