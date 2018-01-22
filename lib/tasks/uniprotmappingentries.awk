zcat $1 | cut -f1,19,20  | awk '{gsub("; ","\",\"");if($3)print "NULL\t"$1"\t[\""$2"\"]\t[\""$3"\"]"}' > $2
