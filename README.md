# Remaining

A deliberately minimal, local-first calorie counter for iOS and Android. It answers one question: how many calories are left today?

## Run

1. Install [Node.js LTS](https://nodejs.org/) and the Expo Go app on an iOS or Android device (or configure an iOS Simulator / Android emulator).
2. In this folder, install dependencies:

   ```bash
   npm install
   ```

3. Start Expo:

   ```bash
   npm start
   ```

4. Scan the terminal QR code with Expo Go, or press `i` for iOS / `a` for Android.

## Notes

- All entries and the target live only on the device in AsyncStorage.
- A new day begins automatically because entries are grouped by their local calendar date; previous entries remain in History.
- The scan screen reads packaged-food barcodes and looks them up in Open Food Facts. It fills the product name and calories per serving when that public database has a match. Barcode lookup needs an internet connection and sends only the barcode to Open Food Facts; there is no Remaining backend.
- After each lookup, tap “Scan another barcode” to immediately resume the camera. You can always enter or correct product details manually.
- There is no production sample data. To add development seed data, update `initialData` in `src/storage.ts` and remove it before release.
