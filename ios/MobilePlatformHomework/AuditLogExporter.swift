import Foundation

@objc(AuditLogExporter)
class AuditLogExporter: NSObject {

  @objc
  func exportLog(_ content: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    let fileName = "audit_log_\(Int(Date().timeIntervalSince1970)).txt"
    let fileURL = docs.appendingPathComponent(fileName)
    do {
      try content.write(to: fileURL, atomically: true, encoding: .utf8)
      resolve(fileURL.path)
    } catch {
      reject("EXPORT_ERROR", error.localizedDescription, error)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
