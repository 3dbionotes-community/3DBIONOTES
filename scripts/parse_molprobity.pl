#!/usr/bin/perl

use strict;
use JSON;
use Cwd;
use File::Basename;

my $suffix =  $ARGV[0] or die "MISSING <SUFFIX> PATH";
my $chain =  $ARGV[1] or die "MISSING PDB <CHAIN>";

my $file = File::Basename::dirname( Cwd::abs_path($0) )."/config.json.cfg";
open(FH,$file) or die "$file NOT FOUND";
my @data = <FH>;
my $ret = decode_json( join("",@data) );

my $out_path=$ret->{upload_path}."/$suffix";

my $n_models  =  decode_json(`cat $out_path/recover_data.json`)->{n_models};
my $aligment =  decode_json(`cat $out_path/alignment.json`);

#$alignment->{'structure_file.pdb'}->{$ch}->{$acc}->{mapping}

my $RAMA = [0];
my $ROTA = [0];
my $OMEGA = [0];
my $MP_GEO = [0];

for(my$n=1;$n<=$n_models;$n++){
  my ($rama,$n_rama) = parse_ramalyze($n);
  $RAMA->[0] = $n_rama if($n_rama > $RAMA->[0]);
  push @{$RAMA}, $rama;  
  
  my ($rota,$n_rota) = parse_rotalyze($n);
  $ROTA->[0] = $n_rota if($n_rota > $ROTA->[0]);
  push @{$ROTA}, $rota;

  my ($omega,$n_omega) = parse_omegalyze($n);
  $OMEGA->[0] = $n_omega if($n_omega > $OMEGA->[0]);
  push @{$OMEGA} , $omega;

  my ($mp_geo,$n_geo) = parse_mp_geop($n);
  $MP_GEO->[0] = $n_geo if($n_geo > $MP_GEO->[0]);
  push @{$MP_GEO} , $mp_geo;
}

print encode_json( {phi_psi=>$RAMA,rota=>$ROTA,omega=>$OMEGA,mp_geo=>$MP_GEO} );

sub parse_ramalyze {
  my $n = shift;
  my @rama = `cat $out_path/MOLPROBITY/model.$n.ramalyze`;
  chomp @rama;
  my $rama = [];
  foreach(@rama){
    my @r = split(/:/,$_);
    my ($tmp,$ch_id,$res_id,$res_type) = split(/\s+/,$r[0]);
    next if($ch_id ne $chain);
    my $score = $r[1];
    my $phi = $r[2];
    my $psi = $r[3];
    my $flag = $r[4];
    my $type = $r[5];
    my $x = map_res($res_id);
    next unless($x>0);
    push @{ $rama } , {begin=>$x,end=>$x,score=>$score,psi=>$psi,phi=>$phi,score_flag=>$flag,ss_type=>$type};
  }
  return ($rama,scalar(@rama));
};

sub parse_omegalyze {
  my $n = shift;
  my @omega = `cat $out_path/MOLPROBITY/model.$n.omegalyze`;
  chomp @omega;
  my $omega = [];
  foreach(@omega){
    my @r = split(/:/,$_);
    my ($tmp,$ch_id,$res_id,$res_type,@tmp) = split(/\s+/,$r[0]);
    next if($ch_id ne $chain);
    my $type = $r[1];
    $type =~ s/\s//g;
    my $omega = $r[2];
    my $conformation = $r[3];
    $type =~ s/\s//g;
    my $mc_bmax = $r[4];
    my $x = map_res($res_id);
    next unless($x>0);
    push @{ $omega } , {begin=>$x,end=>$x,conformation=>$conformation,omega=>$omega,omega_type=>$type,mc_bmax=>$mc_bmax};
  }
  return ($omega,scalar(@omega));
};

sub parse_rotalyze {
  my $n = shift;
  my @rota = `cat $out_path/MOLPROBITY/model.$n.rotalyze`;
  chomp @rota;
  my $rota = [];
  foreach(@rota){
    my @r = split(/:/,$_);
    my ($tmp,$ch_id,$res_id,$res_type) = split(/\s+/,$r[0]);
    next if($ch_id ne $chain);
    my $score = $r[1];
    my $chi1 = $r[3];
    my $chi2 = $r[4];
    my $chi3 = $r[5];
    my $chi4 = $r[6];
    my $flag = $r[7];
    my $type = $r[8];
    my $x = map_res($res_id);
    next unless($x>0);
    push @{ $rota } , {begin=>$x,end=>$x,score=>$score,chi1=>$chi1,chi2=>$chi2,chi3=>$chi3,chi4=>$chi4,score_flag=>$flag,ss_type=>$type};
  }
  return ($rota,scalar(@rota));
};

sub parse_mp_geop {
  my $n = shift;
  my @geo = `cat $out_path/MOLPROBITY/model.$n.mp_geo`;
  chomp @geo;
  my $geo = {};
  foreach(@geo){
    my @r = split(/:/,$_);
    my $ch_id = $r[1];
    $ch_id =~ s/\s//g;
    my $res_id  = $r[2];
    $res_id =~ s/\s//g;
    next if($ch_id ne $chain);
    push @{ $geo->{$res_id} } , {type=>$r[6], value=>$r[7], z_Score=>$r[8]};
  }
  my $array_geo = [];
  foreach( sort{$a<=>$b} keys %{$geo}  ){
    my $x = map_res($_);
    next unless($x>0);
    push @{ $array_geo } , { begin=>$x ,  end=>$x,  geometry=>$geo->{$_}  };
  }
  return ($array_geo,scalar(@{$array_geo}));
};

sub map_res {
  my $res_id = shift;
  my @K = %{ $aligment->{'structure_file.pdb'}->{$chain} };
  my $x = 0;
  $x = $aligment->{'structure_file.pdb'}->{$chain}->{ $K[0] }->{inverse}->{$res_id} if( exists $aligment->{'structure_file.pdb'}->{$chain}->{ $K[0] }->{inverse}->{$res_id} );
  return $x;
}

