#!/bin/sh
#
# Prepare external repositories

cd `dirname $0`/../ext

git clone https://github.com/openscriptures/morphhb.git
git clone https://github.com/openscriptures/HebrewLexicon.git
git clone https://github.com/openscriptures/strongs.git
