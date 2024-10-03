#!/bin/bash

plugin_name="docker.labelInjector"
CWD=$(pwd)
tmpdir="$CWD/tmp/tmp.$(($RANDOM * 19318203981230 + 40))"
version=$(date +"%Y.%m.%d")
filename="$CWD/archive/$plugin_name-$version.txz"
rm "$filename"
dayversion=$(ls "$CWD"/archive/$plugin_name-"$version"*.txz 2>/dev/null | wc -l)

if [ "$dayversion" -gt 0 ]; then
    filename=$CWD/archive/$plugin_name-$version.$dayversion.txz
fi
mkdir -p "$tmpdir"

rsync -av --progress src/$plugin_name/ "$tmpdir" --exclude .git --exclude tmp --exclude .env --exclude archive

cd "$tmpdir" || exit

tar_command="tar"
sed_prefix="-i"

if [[ "$(uname)" == "Darwin" ]]; then
    tar_command="gtar"
    sed_prefix="-i ''"
fi
$tar_command --owner=0 --group=0 -cJf "$filename" .

cd - || exit

if [[ "$(uname)" == "Darwin" ]]; then
    md5hash=$(md5 -q "$filename")
else
    md5hash=$(md5sum "$filename" | awk '{ print $1 }')
fi

rm -rf "$tmpdir"

sed "$sed_prefix" 's/<!ENTITY version ".*">/<!ENTITY version "'"$version"'">/' $plugin_name.plg
sed "$sed_prefix" 's/<!ENTITY md5 ".*">/<!ENTITY md5 "'"$md5hash"'">/' $plugin_name.plg

echo "MD5: $(md5sum "$filename")"
echo "once pushed install via https://raw.githubusercontent.com/phyzical/$plugin_name/main/$plugin_name.plg"

$tar_command -tvf "$filename"
