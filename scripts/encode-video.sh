#!/bin/bash
# Web encodes for the client's video library (see docs/video-library.md).
# Sources are read only. Runs one encode at a time, niced. Usage: scripts/encode-video.sh <job>
set -euo pipefail
SRC="/Users/kait/Desktop/Freelance/Blake & Boky"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/video"
NICE="nice -n 15"
X264="-c:v libx264 -preset slow -profile:v high -threads 8"

hls() { # slug src prefilter w1 h1 crf1 max1 w2 h2 crf2 max2 gop audio(yes|no)
  local slug=$1 src=$2 pre=$3 w1=$4 h1=$5 c1=$6 m1=$7 w2=$8 h2=$9 c2=${10} m2=${11} g=${12} au=${13}
  local d="$OUT/$slug"; rm -rf "$d/1080" "$d/540"; mkdir -p "$d/1080" "$d/540"
  local amap=() vmap="v:0,name:1080 v:1,name:540" aopt=()
  if [ "$au" = yes ]; then amap=(-map 0:a:0 -map 0:a:0); vmap="v:0,a:0,name:1080 v:1,a:1,name:540"; aopt=(-c:a aac -b:a 128k -ac 2 -ar 48000); fi
  $NICE ffmpeg -hide_banner -nostats -loglevel warning -y -i "$SRC/$src" \
    -filter_complex "[0:v]${pre}split=2[a][b];[a]scale=${w1}:${h1}:flags=lanczos,format=yuv420p[v1];[b]scale=${w2}:${h2}:flags=lanczos,format=yuv420p[v2]" \
    -map "[v1]" -map "[v2]" ${amap[@]+"${amap[@]}"} $X264 \
    -crf:v:0 $c1 -maxrate:v:0 $m1 -bufsize:v:0 $(( ${m1%M} * 2 ))M \
    -crf:v:1 $c2 -maxrate:v:1 $m2 -bufsize:v:1 $(( ${m2%k} * 2 ))k \
    -g $g -keyint_min $g -sc_threshold 0 -force_key_frames "expr:gte(t,n_forced*6)" \
    ${aopt[@]+"${aopt[@]}"} \
    -f hls -hls_time 6 -hls_playlist_type vod -hls_flags independent_segments \
    -hls_segment_filename "$d/%v/seg_%03d.ts" -master_pl_name master.m3u8 \
    -var_stream_map "$vmap" "$d/%v/index.m3u8"
}
poster() { # slug src time prefilter
  local d="$OUT/$1"; mkdir -p "$d"
  $NICE ffmpeg -hide_banner -loglevel error -y -ss "$3" -i "$SRC/$2" -frames:v 1 -vf "${4}scale='min(1920,iw)':-2:flags=lanczos" -q:v 3 "$d/poster.jpg"
  local w; w=$(ffprobe -v error -show_entries stream=width -of csv=p=0 "$d/poster.jpg")
  if [ "$w" -gt 1600 ]; then $NICE cwebp -quiet -q 80 -resize 1600 0 "$d/poster.jpg" -o "$d/poster-1600.webp"
  else $NICE cwebp -quiet -q 82 "$d/poster.jpg" -o "$d/poster-1600.webp"; fi
}

case "$1" in
  burning-buddha) # BB 705: 1920x1080p25 ProRes, a lit film with type over fire
    poster burning-buddha "BB 705 Prores 422.mov" 72.5 ""
    hls burning-buddha "BB 705 Prores 422.mov" "" 1920 1080 20 6M 960 540 22 1600k 50 yes ;;
  blake-presentation) # 1440x1080 anamorphic HDV, interlaced tff, 29.97
    poster blake-presentation "blake audio_sculptures_people_landscape_blake_ext_presentation.mov" 601 "yadif=0:-1:0,scale=1920:1080,setsar=1,"
    hls blake-presentation "blake audio_sculptures_people_landscape_blake_ext_presentation.mov" "yadif=0:-1:0," 1920 1080 23 3M 960 540 24 1000k 60 yes ;;
  chicago-interview) # 1550x868p60 h264; 30p is plenty for a seated interview
    poster chicago-interview "Chicago Invterview 2019.mov" 482 ""
    hls chicago-interview "Chicago Invterview 2019.mov" "fps=30," 1550 868 23 3M 964 540 24 1000k 60 yes ;;
  blake-sculptures) # silent B-roll of Blake's bronzes, same venue as the presentation
    poster blake-sculptures "blake audio_sculptures_people_landscape_blake_ext_presentation-1.mov" 30 "yadif=0:-1:0,scale=1920:1080,setsar=1,"
    hls blake-sculptures "blake audio_sculptures_people_landscape_blake_ext_presentation-1.mov" "yadif=0:-1:0," 1920 1080 23 4M 960 540 24 1200k 60 no ;;
  bronze-tilt) # BR135201: 7.6 s tilt up a bronze bust. Palindrome loop (up, then back down), muted.
    d="$OUT/bronze-tilt"; mkdir -p "$d"
    poster bronze-tilt "BR135201.mov" 7.3 ""
    $NICE ffmpeg -hide_banner -loglevel warning -y -i "$SRC/BR135201.mov" -an -filter_complex \
      "[0:v]trim=0:7.55,setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p,split[f][r0];[r0]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1[v]" \
      -map "[v]" $X264 -crf 24 -maxrate 5M -bufsize 10M -g 60 -movflags +faststart "$d/loop-1080.mp4"
    $NICE ffmpeg -hide_banner -loglevel warning -y -i "$d/loop-1080.mp4" -an -vf scale=1280:720:flags=lanczos $X264 -crf 25 -maxrate 2500k -bufsize 5M -g 60 -movflags +faststart "$d/loop-720.mp4"
    $NICE ffmpeg -hide_banner -loglevel warning -y -i "$d/loop-1080.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -threads 8 -deadline good -cpu-used 2 "$d/loop-1080.webm" ;;
  burning-buddha-loop) # BB 705 locked profile shot 120.2 to 127.2 s, no type on screen. 1 s crossfade seam, muted.
    d="$OUT/burning-buddha"; mkdir -p "$d"
    $NICE ffmpeg -hide_banner -loglevel warning -y -ss 120.2 -t 7 -i "$SRC/BB 705 Prores 422.mov" -an -filter_complex \
      "[0:v]scale=1920:1080:flags=lanczos,format=yuv420p,split[a][b];[a]trim=1:7,setpts=PTS-STARTPTS[main];[b]trim=0:1,setpts=PTS-STARTPTS[head];[main]split[m1][m2];[m1]trim=0:5,setpts=PTS-STARTPTS[body];[m2]trim=5:6,setpts=PTS-STARTPTS[tail];[tail][head]xfade=transition=fade:duration=1:offset=0[seam];[body][seam]concat=n=2:v=1[v]" \
      -map "[v]" $X264 -crf 22 -maxrate 6M -bufsize 12M -g 50 -movflags +faststart "$d/loop-1080.mp4"
    $NICE ffmpeg -hide_banner -loglevel warning -y -i "$d/loop-1080.mp4" -an -vf scale=1280:720:flags=lanczos $X264 -crf 24 -maxrate 3M -bufsize 6M -g 50 -movflags +faststart "$d/loop-720.mp4"
    $NICE ffmpeg -hide_banner -loglevel warning -y -i "$d/loop-1080.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -threads 8 -deadline good -cpu-used 2 "$d/loop-1080.webm"
    $NICE ffmpeg -hide_banner -loglevel error -y -ss 3 -i "$d/loop-1080.mp4" -frames:v 1 -q:v 3 "$d/loop-poster.jpg"
    $NICE cwebp -quiet -q 80 -resize 1600 0 "$d/loop-poster.jpg" -o "$d/loop-poster-1600.webp" ;;
  adrasteo) # 69 s film of Andromeda Adrasteo, 640x360, music by Grant Ransom
    d="$OUT/adrasteo"; mkdir -p "$d"
    poster adrasteo "Adrasteo Movie 1,01 - SD 480p.mov" 60.6 ""
    $NICE ffmpeg -hide_banner -loglevel warning -y -i "$SRC/Adrasteo Movie 1,01 - SD 480p.mov" -map 0:v:0 -map 0:a:0 $X264 -crf 21 -maxrate 1800k -bufsize 3600k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$d/adrasteo-360.mp4"
    $NICE ffmpeg -hide_banner -loglevel warning -y -i "$SRC/Adrasteo Movie 1,01 - SD 480p.mov" -map 0:v:0 -map 0:a:0 -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -threads 8 -deadline good -cpu-used 2 -c:a libopus -b:a 112k "$d/adrasteo-360.webm" ;;
  posters-hdv) # posters only for the two anamorphic HDV files
    poster blake-presentation "blake audio_sculptures_people_landscape_blake_ext_presentation.mov" 601 "yadif=0:-1:0,scale=1920:1080,setsar=1,"
    poster blake-sculptures "blake audio_sculptures_people_landscape_blake_ext_presentation-1.mov" 30 "yadif=0:-1:0,scale=1920:1080,setsar=1," ;;
  *) echo "unknown job $1"; exit 1 ;;
esac
echo "done $1"
