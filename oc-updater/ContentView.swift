//
//  ContentView.swift
//  oc-updater
//
//  Created by mswgen on 2022/12/20.
//

import SwiftUI

struct ContentView: View {
    @State private var stage = 0;
    @State private var EFIDirs: [String] = [];
    var body: some View {
        switch stage {
        case 0:
            Home(stage: $stage, EFIDirs: $EFIDirs)
        case 1:
            EFISelector(stage: $stage)
        default:
            Home(stage: $stage, EFIDirs: $EFIDirs)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
