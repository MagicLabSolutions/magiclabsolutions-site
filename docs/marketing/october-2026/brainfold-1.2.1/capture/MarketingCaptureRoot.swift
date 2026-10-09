import SwiftUI
import UIKit

// MARK: - MarketingCaptureRoot

/// Capture-only root, using the actual Catalyst views and bundled localized fixtures.
struct MarketingCaptureRoot: View {
    // MARK: - Properties
    @State private var scene = "study"

    // MARK: - Body
    var body: some View {
        Group {
            if let pack = MockDataProvider.shared.loadAsPacks().first {
                switch scene {
                case "flashcards": NavigationStack { FlashcardsView(pack: pack) }
                case "quiz": NavigationStack { QuizView(pack: pack) }
                case "tutor": NavigationStack { TutorView(pack: pack) }
                case "summary": NavigationStack { SummaryView(pack: pack) }
                case "battle": NavigationStack { BattleSetupView(preselectedPack: pack) }
                default: NavigationStack { PackDetailView(pack: pack) }
                }
            }
        }
        .id(scene)
        .preferredColorScheme(.light)
        .background(CatalystCaptureDriver(scene: $scene).frame(width: 0, height: 0))
    }
}

// MARK: - CatalystCaptureDriver

/// Captures only this process's native view tree into a bitmap; never reads the desktop.
private struct CatalystCaptureDriver: UIViewRepresentable {
    // MARK: - Properties
    @Binding var scene: String

    // MARK: - Public Methods
    /// Creates the native hook after the production view has entered its window.
    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        context.coordinator.begin(view: view, scene: $scene)
        return view
    }

    /// Keeps capture independent of SwiftUI's layout updates.
    func updateUIView(_ uiView: UIView, context: Context) {}

    /// Maintains the six-screen capture sequence.
    func makeCoordinator() -> Coordinator { Coordinator() }

    // MARK: - Coordinator
    final class Coordinator {
        // MARK: - Properties
        private let scenes = ["study", "flashcards", "quiz", "tutor", "summary", "battle"]
        private var index = 0

        // MARK: - Public Methods
        /// Runs only when explicit capture destination and screenshot-mode flags are supplied.
        func begin(view: UIView, scene: Binding<String>) {
            let args = CommandLine.arguments
            guard args.contains("-SCREENSHOT_MODE"), let i = args.firstIndex(of: "-marketing-out"), i + 1 < args.count else { return }
            let target = args[i + 1]
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { self.capture(view: view, scene: scene, target: target) }
        }

        // MARK: - Private Methods
        /// Writes a 2x native UIKit/Catalyst capture and advances to the next real screen.
        private func capture(view: UIView, scene: Binding<String>, target: String) {
            guard let window = view.window, let root = window.rootViewController?.view else {
                print("CAPTURE_ERROR no native window")
                exit(2)
            }
            // Use a native layout canvas matching the original MacBook display.
            window.bounds.size = CGSize(width: 1200, height: 754)
            root.frame = window.bounds
            root.layoutIfNeeded()
            let format = UIGraphicsImageRendererFormat()
            format.scale = 2
            format.opaque = true
            let image = UIGraphicsImageRenderer(size: root.bounds.size, format: format).image { _ in
                root.drawHierarchy(in: root.bounds, afterScreenUpdates: true)
            }
            let file = URL(fileURLWithPath: target).appendingPathComponent("native-\(index + 1).png")
            do { try image.pngData()!.write(to: file) }
            catch { print("CAPTURE_ERROR \(error)"); exit(3) }
            print("CAPTURE \(scenes[index]) \(Int(image.size.width * image.scale))x\(Int(image.size.height * image.scale)) locale=\(Bundle.main.preferredLocalizations.joined(separator: ","))")
            fflush(stdout)
            index += 1
            if index == scenes.count { exit(0) }
            scene.wrappedValue = scenes[index]
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) { self.capture(view: view, scene: scene, target: target) }
        }
    }
}
