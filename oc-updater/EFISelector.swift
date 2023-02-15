//
//  EFISelector.swift
//  OpenCore Updater
//
//  Created by mswgen on 2022/12/21.
//

import SwiftUI

struct EFISelector: View {
    @Binding var stage: Int
    var body: some View {
        Text("Select EFI")
            .font(.largeTitle)
        Text("Choose a disk or folder")
            .font(.subheadline)
        ScrollView(.horizontal) {
            HStack {
                ForEach (getListOfESP(), id: \.self) {part in
                    DiskView(partInfo: part)
                        .padding()
                }
            }
        }
        .toolbar {
            ToolbarItem {
                Button {
                    stage = 1
                } label: {
                    Label("Open ESP from disk", systemImage: "opticaldiscdrive")
                }
                .disabled(true)
            }
            ToolbarItem {
                Button {
                    
                } label: {
                    Label("Select EFI folder", systemImage: "folder")
                }
            }
        }
    }
}

struct EFISelector_Previews: PreviewProvider {
    static var previews: some View {
        EFISelector(stage: .constant(1))
    }
}
