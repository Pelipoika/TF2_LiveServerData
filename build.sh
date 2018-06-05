#!/bin/bash
#
# Author : Benoist
#

# Download latest lib of gcc & g++ so we can run spcomp
apt-get update
apt-get install --no-install-recommends -y gcc-multilib g++-multilib
# Install zip for github release
apt-get install --no-install-recommends zip

# Download sourcemod
wget -q "http://www.sourcemod.net/latest.php?version=1.8&os=linux" -O sourcemod.tar.gz
tar -xzvf sourcemod.tar.gz
cd addons/sourcemod/scripting/
chmod +x spcomp
chmod +x compile.sh
# Delete every .sp within sourcemod scripting folder
find . -name "*.sp" -type f -delete
# Add our dependencies
cd include
wget "http://raw.githubusercontent.com/KyleSanderson/SteamWorks/master/Pawn/includes/SteamWorks.inc" -O SteamWorks.inc

# Move .sp & .inc to the scripting folder
cd ../../../..
find . -name '*.sp' -exec mv -vf {} addons/sourcemod/scripting \;
cd include
find . -name '*.inc' -exec mv {} ../addons/sourcemod/scripting/include \;
cd ../addons/sourcemod/scripting/
# Compile the plugin
./spcomp serverdata.sp -oserverdata.smx
if [[ $? != 0 ]]; then
	exit 1
fi

# ==========================
# Upload Release
# ==========================

# Zip the plugin
zip serverdata_release.zip serverdata.smx

# Variables
GITHUB_API="https://api.github.com/repos/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME"
GITHUB_API_RELEASES="$GITHUB_API/releases"
AUTHORIZATION="Authorization: token $REPO_TOKEN"

# Validate authorization token
curl -o /dev/null -sH "$AUTHORIZATION" $GITHUB_API || { echo "Build error: Invalid repository token!";  exit 1; }

# Draft new release
GITHUB_RELEASE_NAME="[TF2] Live Server Data - Build #$CIRCLE_BUILD_NUM"
GITHUB_RELEASE_TAG="v1.$CIRCLE_BUILD_NUM"
GITHUB_RELEASE_DATA="{\"tag_name\": \"$GITHUB_RELEASE_TAG\", \"target_commitish\": \"master\", \"name\": \"$GITHUB_RELEASE_NAME\", \"body\": \" \", \"draft\": false, \"prerelease\": false}"
echo "$GITHUB_RELEASE_DATA"
GITHUB_RELEASE_RESPONSE=$(curl -H "Content-Type: application/json" \
 -H "$AUTHORIZATION" \
  --request POST \
  --data "$GITHUB_RELEASE_DATA" \
  $GITHUB_API_RELEASES)

# Props to stefanbuck
eval $(echo "$GITHUB_RELEASE_RESPONSE" | grep -m 1 "id.:" | grep -w id | tr : = | tr -cd '[[:alnum:]]=')
[ "$id" ] || { echo "Error: Failed to get release id"; echo "$GITHUB_RELEASE_RESPONSE" | awk 'length($0)<100' >&2; exit 1; }
GITHUB_RELEASE_ID="$id"

# Upload the smx
GITHUB_API_UPLOAD="https://uploads.github.com/repos/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME/releases/$GITHUB_RELEASE_ID/assets?name=serverdata_release.zip"
echo "$GITHUB_API_UPLOAD"
curl "$GITHUB_OAUTH_BASIC" --data-binary @"serverdata_release.zip" -H "$AUTHORIZATION" -H "Content-Type: application/octet-stream" $GITHUB_API_UPLOAD