// Redraws a PNG into an RGB context with no alpha channel (App Store icons must have none).
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path) as CFURL
    guard let source = CGImageSourceCreateWithURL(url, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil),
          let context = CGContext(data: nil, width: image.width, height: image.height, bitsPerComponent: 8,
                                  bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                                  bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
    else { fatalError("Can't read \(path)") }
    context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
    guard let flat = context.makeImage(),
          let destination = CGImageDestinationCreateWithURL(url, UTType.png.identifier as CFString, 1, nil)
    else { fatalError("Can't write \(path)") }
    CGImageDestinationAddImage(destination, flat, nil)
    CGImageDestinationFinalize(destination)
}
