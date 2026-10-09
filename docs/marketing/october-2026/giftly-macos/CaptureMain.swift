import SwiftUI
import SwiftData
import AppKit
import CoreText

// Capture-only entry point. Runs native MacRootView without sync, billing or notifications.
@main
struct GiftlyNativeMarketingCapture {
    @MainActor static func main() throws {
        let app = NSApplication.shared
        app.setActivationPolicy(.prohibited)
        app.appearance = NSAppearance(named: .aqua)
        let args = CommandLine.arguments
        func value(_ key: String, _ fallback: String) -> String {
            guard let i = args.firstIndex(of: key), i + 1 < args.count else { return fallback }
            return args[i + 1]
        }
        let language = value("-marketingLocale", "en-US")
        let screen = value("-marketingScreen", "today")
        let target = value("-marketingOut", "/private/tmp/giftly-mac.png")
        for url in Bundle.main.urls(forResourcesWithExtension: "ttf", subdirectory: nil) ?? [] {
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
        let config = ModelConfiguration(schema: PersistenceManager.schema, isStoredInMemoryOnly: true, cloudKitDatabase: .none)
        let container = try ModelContainer(for: PersistenceManager.schema, configurations: [config])
        SampleData.seed(into: container.mainContext)
        let people = try container.mainContext.fetch(FetchDescriptor<Person>())
        for person in people { person.notes = "" }
        let emma = people.first { $0.name == "Emma Chen" }!
        emma.clothingSize = value("-marketingSize", "Medium")
        try container.mainContext.save()
        let state = AppState()
        state.selectedTab = AppTab(rawValue: screen) ?? .today
        state.openPerson = emma
        let view = MacRootView()
            .environmentObject(state)
            .modelContainer(container)
            .tint(GFColors.evergreen)
            .preferredColorScheme(.light)
            .environment(\.calendar, .giftly)
            .environment(\.locale, Locale(identifier: language))
            .environment(\.layoutDirection, ["ar", "he"].contains(language) ? .rightToLeft : .leftToRight)
            .frame(width: 1280, height: 800)
        let host = NSHostingView(rootView: view)
        host.frame = NSRect(x: 0, y: 0, width: 1280, height: 800)
        let window = NSWindow(contentRect: host.frame, styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "Giftly"
        window.contentView = host
        window.setFrameOrigin(NSPoint(x: -10000, y: -10000))
        window.orderBack(nil)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) {
            host.layoutSubtreeIfNeeded()
            DebugWindowCapture.capture(window, to: target)
            print("CAPTURE \(language) \(screen) bundle=\(Bundle.main.preferredLocalizations.joined(separator: ","))")
            app.terminate(nil)
        }
        app.run()
    }
}
