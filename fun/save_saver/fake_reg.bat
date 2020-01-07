set TARGET_DIR="%UserProfile%\Documents\HARUKAZE"
set TARGET_LINK="%UserProfile%\Documents\HARUKAZE\【绿茶汉化组】野良与皇女与流浪猫之心２"
if not exist %TARGET_DIR% md %TARGET_DIR%
if not exist %TARGET_LINK% mklink /J %TARGET_LINK% "%cd%"