#!/bin/bash

# EnergyTune IPA Build Script
# This script builds and packages the iOS app into an IPA file

set -e  # Exit on error

echo "🔨 Starting IPA build process..."

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Clean and Archive
echo "📦 Step 1/2: Archiving iOS app..."
rm -rf ios/build/EnergyTune.xcarchive ios/build/Payload EnergyTune.ipa

xcodebuild -workspace ios/EnergyTune.xcworkspace \
  -scheme EnergyTune \
  -configuration Release \
  -sdk iphoneos \
  -archivePath ios/build/EnergyTune.xcarchive \
  clean archive \
  CODE_SIGNING_ALLOWED=NO \
  SKIP_INSTALL=NO \
  2>&1 | grep -E "(ARCHIVE|SUCCEEDED|FAILED|error)" || true

# Check if archive succeeded
if [ ! -d "ios/build/EnergyTune.xcarchive" ]; then
  echo "❌ Archive failed!"
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

