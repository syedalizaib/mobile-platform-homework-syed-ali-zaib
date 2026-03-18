#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AuditLogExporter, NSObject)

RCT_EXTERN_METHOD(exportLog:(NSString *)content
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
