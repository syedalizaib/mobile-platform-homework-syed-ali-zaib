import { NativeModules, Platform } from 'react-native';

const { AuditLogExporter } = NativeModules;

export const exportLog = (content: string): Promise<string> => {
  if (!AuditLogExporter) {
    return Promise.reject(
      new Error('AuditLogExporter native module not found')
    );
  }
  return AuditLogExporter.exportLog(content);
};
