#!/bin/bash

# EnergyTune IPA Build Script
# This script builds and packages the iOS app into an IPA file

echo "🔨 Starting IPA build process..."

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Clean and Archive
echo "📦 Step 1/2: Archiving iOS app..."
rm -rf ios/build/EnergyTune.xcarchive ios/build/Payload EnergyTune.ipa

# Create build log file
BUILD_LOG="ios/build/build.log"
mkdir -p ios/build

echo "Building... (this may take a few minutes)"
echo "Full build log will be saved to: $BUILD_LOG"

# Run xcodebuild and capture output
if xcodebuild -workspace ios/EnergyTune.xcworkspace \
  -scheme EnergyTune \
  -configuration Release \
  -sdk iphoneos \
  -archivePath ios/build/EnergyTune.xcarchive \
  clean archive \
  CODE_SIGNING_ALLOWED=NO \
  SKIP_INSTALL=NO \
  > "$BUILD_LOG" 2>&1; then
  
  # Show summary
  echo ""
  grep -E "(ARCHIVE|SUCCEEDED|FAILED|error:|warning:)" "$BUILD_LOG" | tail -n 20 || true
  echo ""
else
  BUILD_FAILED=1
fi

# Check if archive succeeded
if [ ! -d "ios/build/EnergyTune.xcarchive" ] || [ -n "$BUILD_FAILED" ]; then
  echo ""
  echo "❌ Archive failed!"
  echo ""
  echo "Last 30 lines of build log:"
  echo "----------------------------------------"
  tail -n 30 "$BUILD_LOG"
  echo "----------------------------------------"
  echo ""
  echo "Full build log available at: $BUILD_LOG"
  echo "Run: cat $BUILD_LOG | grep -i error"
  exit 1
fi

echo "✅ Archive completed successfully!"

# Step 2: Package IPA
echo "📱 Step 2/2: Packaging IPA file..."
rm -rf ios/build/Payload
mkdir -p ios/build/Payload
cp -R ios/build/EnergyTune.xcarchive/Products/Applications/EnergyTune.app ios/build/Payload/

cd ios/build
zip -r EnergyTune.ipa Payload >/dev/null
cd ../..

mv ios/build/EnergyTune.ipa EnergyTune.ipa

# Display result
if [ -f "EnergyTune.ipa" ]; then
  SIZE=$(ls -lh EnergyTune.ipa | awk '{print $5}')
  echo ""
  echo "✅ IPA build complete!"
  echo "📦 File: EnergyTune.ipa"
  echo "📏 Size: $SIZE"
  echo "📍 Location: $(pwd)/EnergyTune.ipa"
else
  echo "❌ IPA packaging failed!"
  exit 1
fi

