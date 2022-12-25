//
//  Homr.swift
//  oc-updater
//
//  Created by mswgen on 2022/12/20.
//

import SwiftUI

struct Home: View {
    var body: some View {
        VStack {
            Text("OpenCore Updater")
                .font(.largeTitle)
            Text("Update your OpenCore easily")
                .font(.subheadline)
            Button {
                EFISelector()
            } label: {
                Text("Start")
            }
        }
        .padding()
    }
}

struct Home_Previews: PreviewProvider {
    static var previews: some View {
        Home()
    }
}
