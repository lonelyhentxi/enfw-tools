# SAVE SAVER

This is a simple script to keep your galgame savedata portable, 
while many of them place savedata at your user documents folder.

This script help you to place savedata in the game's folder, and create soft link to required folder.

## Usage

1. Open the `fake_reg.bat` with ASCII encoding. 
2. Edit the `fake_reg.bat` file, replace `TARGET_DIR` with the outer folder of the target savedata folder of your galgame
, and replace `TARGET_LINK` with the target savedata folder of your galgame.
3. Create a `savedata` folder at the root folder of your galgame.
4. Copy all contents of the target savedata folder of your galgame to the created `savedata` folder.
5. Copy the edited `fake_reg.bat` file to the created `savedata` folder.
6. Run the copied `fake_reg.bat` file.