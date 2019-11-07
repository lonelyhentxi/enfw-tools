INPUT_PATH='/storage/music/cloud_music'
OUTPUT_PATH='/storage/music/aac_music'
TMP_PATH='/tmp/enfw-tools/music'

mkdir $OUTPUT_PATH -p
mkdir $TMP_PATH -p
for input_path in $INPUT_PATH/*
do
    name = $(echo $input_path | awk '{sub(/^.*\/([^\/]+?)$/,"$1");print}')
    echo "starting task $name in $INPUT_PATH/$name"
    output_name=$(echo $name | awk '{sub(/\.\w+?$/,".aac");print}')
    wav_name=$(echo $name | awk '{sub(/\.\w+?$/,".wav");print}')
    wav_path="$TMP_PATH$wav_name"
    aac_path="$OUTPUT_PATH$output_name"
    echo "decode to wave file in $wav_path..."
    ffmpeg -i $input_path -vn -sn -v 0 -c:a pcm_s16le -f wav $wav_path
    echo "encode to aac file in $aac_path..."
    neroAacEnc -2pass -lc -br 256000 -if "$wav_path" -of "$aac_path"
    echo "remove temp file in $wav_path"
    rm "$wav_path" -f
done