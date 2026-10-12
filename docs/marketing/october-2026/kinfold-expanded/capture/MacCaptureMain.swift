import SwiftUI
import SwiftData
import AppKit

// Isolated capture executable: production views, synthetic in-memory data, no foreground activation.
@main
struct KinfoldMacCapture {
    @MainActor static func main() throws {
        let app = NSApplication.shared
        app.setActivationPolicy(.prohibited)
        app.appearance = NSAppearance(named: .darkAqua)
        let args = CommandLine.arguments
        func value(_ key: String, _ fallback: String) -> String {
            guard let i = args.firstIndex(of: key), i + 1 < args.count else { return fallback }
            return args[i + 1]
        }
        let locale = value("-marketingLocale", "en-US")
        let output = value("-marketingOut", "/private/tmp/kinfold-mac-native.png")
        let router = AppRouter()
        switch ProcessInfo.processInfo.environment["FV_DEBUG_TAB"] {
        case "trips": router.selectedTab = .trips
        case "schedule": router.selectedTab = .schedule
        case "search": router.selectedTab = .search
        default: router.selectedTab = .vault
        }
        // Capture the production detail view with the Mac sidebar omitted from the composition.
        let root = router.selectedTab.rootView
            .environment(router)
            .modelContainer(PersistenceController.shared.container)
            .environment(\.locale, Locale(identifier: locale))
            .environment(\.layoutDirection, ["ar", "he", "ur"].contains(locale) ? .rightToLeft : .leftToRight)
            .preferredColorScheme(.dark)
            .frame(width: 1440, height: 900)
        let host = NSHostingView(rootView: root)
        host.frame = NSRect(x: 0, y: 0, width: 1440, height: 900)
        let window = NSWindow(contentRect: host.frame, styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "Kinfold"
        window.contentView = host
        window.setFrameOrigin(NSPoint(x: -10000, y: -10000))
        window.makeKeyAndOrderFront(nil)
        DispatchQueue.main.asyncAfter(deadline: .now() + 7) {
            host.layoutSubtreeIfNeeded()
            host.displayIfNeeded()
            window.displayIfNeeded()
            guard let bitmap = host.bitmapImageRepForCachingDisplay(in: host.bounds) else { fatalError("No native bitmap") }
            host.cacheDisplay(in: host.bounds, to: bitmap)
            guard let png = bitmap.representation(using: .png, properties: [:]) else { fatalError("No PNG") }
            do { try png.write(to: URL(fileURLWithPath: output)); print("CAPTURE \(locale) \(bitmap.pixelsWide)x\(bitmap.pixelsHigh)") }
            catch { fatalError("Capture write failed: \(error)") }
            app.terminate(nil)
        }
        app.run()
    }
}
