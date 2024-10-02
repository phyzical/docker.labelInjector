#!/bin/bash

CWD=$(pwd)
tmpdir="$CWD/tmp/tmp.$(($RANDOM * 19318203981230 + 40))"
version=$(date +"%Y.%m.%d")
filename="$CWD/archive/docker.labelInjector-$version.txz"
rm "$filename"
dayversion=$(ls "$CWD"/archive/docker.labelInjector-"$version"*.txz 2>/dev/null | wc -l)

if [ "$dayversion" -gt 0 ]; then
    filename=$CWD/archive/docker.labelInjector-$version.$dayversion.txz
fi
mkdir -p "$tmpdir"

rsync -av --progress src/docker.labelInjector/ "$tmpdir" --exclude .git --exclude tmp --exclude .env --exclude archive

cd "$tmpdir" || exit

tar_command="tar"
if [[ "$(uname)" == "Darwin" ]]; then
    tar_command="gtar"
fi
$tar_command --owner=0 --group=0 -cJf "$filename" .

cd - || exit

rm -rf "$tmpdir"

sed -i '' 's/<!ENTITY version ".*">/<!ENTITY version "'"$version"'">/' docker.labelInjector.plg
md5hash=$(md5 -q "$filename")
sed -i '' 's/<!ENTITY md5 ".*">/<!ENTITY md5 "'"$md5hash"'">/' docker.labelInjector.plg

echo "MD5: $(md5sum "$filename")"
echo "once pushed install via https://raw.githubusercontent.com/phyzical/docker.labelInjector/main/docker.labelInjector.plg"

$tar_command -tvf "$filename"
