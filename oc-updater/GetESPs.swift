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
    case SATA = "SATA SSD or HDD";
    case USB = "USB stick or External SSD/HDD"
    case other = "Unknown"
}

struct DiskInfo: Hashable {
    var BSDName: String;
    var model: String;
    var devType: DiskType;
    var sizeGB: Int;
    var ESPBSDName: String;
    var iconBundle: String;
    var iconPath: String;
}

func getListOfESP() -> [DiskInfo] {
    var kernRetn: kern_return_t;
    var servicesIter: io_iterator_t = 0;
    var service: io_object_t;
    let daSession = DASessionCreate(kCFAllocatorDefault)
    var retnVal: [DiskInfo] = [];
    if #available(macOS 12.0, *) {
        kernRetn = IOServiceGetMatchingServices(kIOMainPortDefault, IOServiceMatching(kIOBlockStorageDriverClass), &servicesIter)
    } else {
        kernRetn = IOServiceGetMatchingServices(kIOMasterPortDefault, IOServiceMatching(kIOBlockStorageDriverClass), &servicesIter)
    }
    if kernRetn != KERN_SUCCESS {
        
    } else {
        var pDict: Unmanaged<CFMutableDictionary>?
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
                            let disk = DADiskCreateFromBSDName(kCFAllocatorDefault, daSession!, dict["BSD Name"] as! String)!
                            let rawInfo = DADiskCopyDescription(disk) as! [String: Any]
                            if ["PCI-Express", "SATA", "USB"].contains(rawInfo["DADeviceProtocol"] as! String) {
                                let diskInfo = DiskInfo(BSDName: rawInfo["DAMediaBSDName"] as! String, model: (rawInfo["DADeviceModel"] as! String).trimmingCharacters(in: CharacterSet(charactersIn: " ")), devType: rawInfo["DADeviceProtocol"] as! String == "PCI-Express" ? .PCIe : (rawInfo["DADeviceProtocol"] as! String == "SATA" ? .SATA : .other), sizeGB: (rawInfo["DAMediaSize"] as! Int) / 1000000000, ESPBSDName: "\(rawInfo["DAMediaBSDName"] as! String)s1", iconBundle: (rawInfo["DAMediaIcon"] as! [String: String])["CFBundleIdentifier"]!, iconPath: (rawInfo["DAMediaIcon"] as! [String: String])["IOBundleResourceFile"]!)
                                retnVal.append(diskInfo)
                            }
                        }
                    }
                }
            }
        }
    }
    return retnVal
}
