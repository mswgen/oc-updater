//
//  DiskView.swift
//  OpenCore Updater
//
//  Created by mswgen on 2022/12/24.
//

import SwiftUI
import IOKit.kext
import AppKit

struct DiskView: View {
    let partInfo: PartInfo
    var body: some View {
        VStack {
            Image(nsImage: NSImage(contentsOf: (KextManagerCreateURLForBundleIdentifier(kCFAllocatorDefault, partInfo.iconBundle as CFString)!.takeRetainedValue() as NSURL).appendingPathComponent("Contents/Resources/\(partInfo.iconPath)")!)!)
                .resizable()
                .aspectRatio(1, contentMode: .fit)
                .frame(height: 200)
            Text(partInfo.model)
                .font(.headline)
            Text("\(partInfo.sizeGB) GB \(partInfo.devType.rawValue) (\(partInfo.dskBSDName))")
                .font(.footnote)
        }
        .padding()
    }
}

struct DiskView_Previews: PreviewProvider {
    static var previews: some View {
        DiskView(partInfo: PartInfo(BSDName: "disk1", model: "Samsung SSD 970 EVO Plus 500GB", devType: .PCIe, sizeGB: 500, ESPBSDName: "disk1s1", dskBSDName: "disk1", iconBundle: "com.apple.iokit.IOStorageFamily", iconPath: "Internal.icns"))
        .padding()
    }
}
