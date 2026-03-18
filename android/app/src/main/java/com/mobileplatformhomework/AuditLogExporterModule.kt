package com.mobileplatformhomework

import android.os.Environment
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class AuditLogExporterModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AuditLogExporter"

  @ReactMethod
  fun exportLog(content: String, promise: Promise) {
    try {
      val dir = reactApplicationContext.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
        ?: reactApplicationContext.filesDir
      val file = File(dir, "audit_log_${System.currentTimeMillis()}.txt")
      file.writeText(content)
      promise.resolve(file.absolutePath)
    } catch (e: Exception) {
      promise.reject("EXPORT_ERROR", e.message)
    }
  }
}
