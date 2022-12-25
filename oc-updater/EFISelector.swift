//
//  EFISelector.swift
//  OpenCore Updater
//
//  Created by mswgen on 2022/12/21.
//

import SwiftUI

struct EFISelector: View {
    var body: some View {
        Text("Select EFI")
            .font(.title)
        Text("Choose a disk or folder")
            .font(.subheadline)
        ScrollView(.horizontal) {
            HStack {
                ForEach (getListOfESP(), id: \.self) {disk in
                    DiskView(diskInfo: disk)
                }
            }
        }
    }
}

struct EFISelector_Previews: PreviewProvider {
    static var previews: some View {
        EFISelector()
    }
}
