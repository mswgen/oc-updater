//
//  ContentView.swift
//  oc-updater
//
//  Created by mswgen on 2022/12/20.
//

import SwiftUI

struct ContentView: View {
    @State private var stage = 0;
    var body: some View {
        switch stage {
        case 0:
            Home()
        case 1:
            EFISelector()
        default:
            Home()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
