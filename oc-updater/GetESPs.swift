//
//  GetESPs.swift
//  OpenCore Updater
//
//  Created by mswgen on 2022/12/21.
//

import Foundation
import IOKit
import IOKit.storage
import DiskArbitration

enum DiskType: String {
    case PCIe = "NVMe SSD";
    case SATA = "SATA Disk";
    case USB = "External Disk"
    case other = "Unknown"
}

struct PartInfo: Hashable {
    var BSDName: String;
    var model: String;
    var devType: DiskType;
    var sizeGB: Int;
    var ESPBSDName: String;
    var dskBSDName: String;
    var iconBundle: String;
    var iconPath: String;
}

func getListOfESP() -> [PartInfo] {
    var kernRetn: kern_return_t;
    var servicesIter: io_iterator_t = 0;
    var service: io_object_t;
    let daSession = DASessionCreate(kCFAllocatorDefault)
    var retnVal: [PartInfo] = [];
    if #available(macOS 12.0, *) {
        kernRetn = IOServiceGetMatchingServices(kIOMainPortDefault, IOServiceMatching(kIOBlockStorageDriverClass), &servicesIter)
    } else {
        kernRetn = IOServiceGetMatchingServices(kIOMasterPortDefault, IOServiceMatching(kIOBlockStorageDriverClass), &servicesIter)
    }
    if kernRetn != KERN_SUCCESS {
        
    } else {
        while true {
            service = IOIteratorNext(servicesIter);
            var deviceIter: io_iterator_t = 0;
            var device: io_object_t;
            if service == 0 {
                break;
            }
            kernRetn = IORegistryEntryCreateIterator(service, kIOServicePlane, IOOptionBits(kIORegistryIterateRecursively), &deviceIter);
            if kernRetn != KERN_SUCCESS {
                
            } else {
                while true {
                    device = IOIteratorNext(deviceIter);
                    if device == 0 {
                        break;
                    }
                    var propertyDictionary: Unmanaged<CFMutableDictionary>?
                    kernRetn = IORegistryEntryCreateCFProperties(device, &propertyDictionary, kCFAllocatorDefault, 0)
                    if kernRetn != KERN_SUCCESS {
                        
                    } else {
                        let dict = propertyDictionary!.takeRetainedValue() as! Dictionary<String, Any>
                        if dict["Content"] as? String == "GUID_partition_scheme" {
                            
                        } else if dict["Content"] as? String == "C12A7328-F81F-11D2-BA4B-00A0C93EC93B" {
                            let part = DADiskCreateFromBSDName(kCFAllocatorDefault, daSession!, dict["BSD Name"] as! String)!
                            let partRawInfo = DADiskCopyDescription(part) as! [String: Any]
                            print(partRawInfo)
                            let disk = DADiskCreateFromBSDName(kCFAllocatorDefault, daSession!, (dict["BSD Name"] as! String).split(separator: "s", maxSplits: 2).prefix(2).joined(separator: "s"))!
                            let dskRawInfo = DADiskCopyDescription(disk) as! [String: Any]
                            print(dskRawInfo)
                            print("------")
                            if ["PCI-Express", "SATA", "USB"].contains(dskRawInfo["DADeviceProtocol"] as? String) {
                                let partInfo = PartInfo(
                                    BSDName: dskRawInfo["DAMediaBSDName"] as! String,
                                    model: (dskRawInfo["DADeviceModel"] as! String).trimmingCharacters(in: CharacterSet(charactersIn: " ")),
                                    devType: dskRawInfo["DADeviceProtocol"] as! String == "PCI-Express" ? .PCIe : (dskRawInfo["DADeviceProtocol"] as! String == "SATA" ? .SATA : .other),
                                    sizeGB: (dskRawInfo["DAMediaSize"] as! Int) / 1000000000,
                                    ESPBSDName: dskRawInfo["DAMediaBSDName"] as! String,
                                    dskBSDName: (dskRawInfo["DAMediaBSDName"] as! String).split(separator: "s", maxSplits: 2).prefix(2).joined(separator: "s"),
                                    iconBundle: (dskRawInfo["DAMediaIcon"] as! [String: String])["CFBundleIdentifier"]!,
                                    iconPath: (dskRawInfo["DAMediaIcon"] as! [String: String])["IOBundleResourceFile"]!)
                                retnVal.append(partInfo)
                            }
                        }
                    }
                }
            }
        }
    }
    return retnVal
}
