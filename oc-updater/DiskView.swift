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
    let diskInfo: DiskInfo
    var body: some View {
        VStack {
            Image(nsImage: NSImage(contentsOf: (KextManagerCreateURLForBundleIdentifier(kCFAllocatorDefault, diskInfo.iconBundle as CFString)!.takeRetainedValue() as NSURL).appendingPathComponent("Contents/Resources/\(diskInfo.iconPath)")!)!)
            Text(diskInfo.model)
                .font(.largeTitle)
            Text("\(diskInfo.sizeGB) GB \(diskInfo.devType.rawValue)")
                .font(.title)
        }
        .padding()
    }
}

struct DiskView_Previews: PreviewProvider {
    static var previews: some View {
        DiskView(diskInfo: DiskInfo(BSDName: "disk1", model: "Samsung SSD 970 EVO Plus 500GB", devType: .PCIe, sizeGB: 500, ESPBSDName: "disk1s1", iconBundle: "com.apple.iokit.IOStorageFamily", iconPath: "Internal.icns"))
        .padding()
    }
}
