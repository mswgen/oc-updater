//
//  Home.swift
//  oc-updater
//
//  Created by mswgen on 2022/12/20.
//

import SwiftUI

struct Home: View {
    @Binding var stage: Int;
    @Binding var EFIDirs: [String];
    var body: some View {
        VStack {
            Text("OpenCore Updater")
                .font(.largeTitle)
            Text("Update your OpenCore easily")
                .font(.subheadline)
        }
        .padding()
        .toolbar {
            ToolbarItem {
                Button {
                    stage = 1
                } label: {
                    Label("Open ESP from disk", systemImage: "opticaldiscdrive")
                }
            }
            ToolbarItem {
                Button {
                    let panel = NSOpenPanel()
                    panel.allowsMultipleSelection = false
                    panel.canChooseDirectories = true
                    if panel.runModal() == .OK {
                        EFIDirs.append(panel.url?.lastPathComponent ?? "<none>")
                        Alert(title: Text("EFI Dir"), message: Text(EFIDirs.last!))
                    }
                } label: {
                    Label("Select EFI folder", systemImage: "folder")
                }
            }
        }
    }
}

struct Home_Previews: PreviewProvider {
    static var previews: some View {
        Home(stage: .constant(0), EFIDirs: .constant([]))
    }
}
