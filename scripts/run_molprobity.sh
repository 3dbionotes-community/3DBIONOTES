#!/bin/bash

suffix=$1;

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_FILE=$DIR"/config.json.cfg"

models_path=`$DIR/read_json $CONFIG_FILE upload_path`"/"$suffix"/MODELS";
out_path=`$DIR/read_json $CONFIG_FILE upload_path`"/"$suffix"/MOLPROBITY";

if [ $2 == "pdb" ]; then
  models_path=`$DIR/read_json $CONFIG_FILE tmp_path`"/tmp_mp/"$suffix"/MODELS";
  out_path=`$DIR/read_json $CONFIG_FILE tmp_path`"/tmp_mp/"$suffix"/MOLPROBITY";
fi

if [ $2 == "interactome3d" ]; then
  models_path=`$DIR/read_json $CONFIG_FILE interactome3d_path`"/pdb/"$suffix;
  out_path=`$DIR/read_json $CONFIG_FILE tmp_path`"/tmp_mp/"$suffix"/MOLPROBITY";
fi

molprobity_path=`$DIR/read_json $CONFIG_FILE molprobity_bin`;

for i in `ls $models_path`; do
  file=$models_path/$i;
  out_file_suffix=$(echo $i | sed 's/\.pdb//');
  if [ $2 == "interactome3d" ]; then
    file=$i
    out_file_suffix="model.1";
  fi

  echo "running phenix.ramalyze $i";
  $molprobity_path/phenix.ramalyze $file | awk  -F":" '{if($5=="OUTLIER")print $0}' >  $out_path/$out_file_suffix.ramalyze
  echo "running phenix.rotalyze $i";
  $molprobity_path/phenix.rotalyze $file | awk  -F":" '{if($8=="OUTLIER")print $0}' > $out_path/$out_file_suffix.rotalyze
  echo "running phenix.omegalyze $i";
  $molprobity_path/phenix.omegalyze $file nontrans_only=False | awk  -F":" '{if($4!~/Trans/ && $1!~/SUMMARY/)print $0}' > $out_path/$out_file_suffix.omegalyze
  #echo "running phenix.mp_geo $i";
  #$molprobity_path/mmtbx.mp_geo $file cdl=False outliers_only=True bonds_and_angles=True > $out_path/$out_file_suffix.mp_geo
done

SCRIPTPATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

touch "$out_path/done"
