Clazz.declarePackage ("J.adapter.readers.xtal");
Clazz.load (["J.adapter.smarter.AtomSetCollectionReader"], "J.adapter.readers.xtal.VaspPoscarReader", ["JU.Lst", "$.PT", "$.SB"], function () {
c$ = Clazz.decorateAsClass (function () {
this.atomLabels = null;
this.ac = 0;
this.title = null;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.xtal, "VaspPoscarReader", J.adapter.smarter.AtomSetCollectionReader);
Clazz.overrideMethod (c$, "initializeReader", 
function () {
this.readJobTitle ();
this.readUnitCellVectors ();
this.readMolecularFormula ();
this.readCoordinates ();
this.continuing = false;
});
Clazz.defineMethod (c$, "readJobTitle", 
 function () {
this.asc.setAtomSetName (this.title = this.rd ().trim ());
});
Clazz.defineMethod (c$, "readUnitCellVectors", 
 function () {
this.setSpaceGroupName ("P1");
this.setFractionalCoordinates (true);
var scaleFac = this.parseFloatStr (this.rd ().trim ());
var unitCellData =  Clazz.newFloatArray (9, 0);
this.fillFloatArray (null, 0, unitCellData);
if (scaleFac != 1) for (var i = 0; i < unitCellData.length; i++) unitCellData[i] *= scaleFac;

this.addPrimitiveLatticeVector (0, unitCellData, 0);
this.addPrimitiveLatticeVector (1, unitCellData, 3);
this.addPrimitiveLatticeVector (2, unitCellData, 6);
});
Clazz.defineMethod (c$, "readMolecularFormula", 
 function () {
var elementLabel = JU.PT.getTokens (this.discardLinesUntilNonBlank ());
var elementCounts;
if (JU.PT.parseInt (elementLabel[0]) == -2147483648) {
elementCounts = JU.PT.getTokens (this.rd ());
} else {
elementCounts = elementLabel;
elementLabel = JU.PT.split (this.title, " ");
if (elementLabel.length != elementCounts.length) {
elementLabel = JU.PT.split ("Al B C Db Eu F Ga Hf I K Li Mn N O P Ru S Te U V W Xe Yb Zn", " ");
this.appendLoadNote ("using pseudo atoms Al B C Db...");
}}var mf =  new JU.SB ();
this.atomLabels =  new JU.Lst ();
for (var i = 0; i < elementCounts.length; i++) {
var n = Integer.parseInt (elementCounts[i]);
this.ac += n;
var label = elementLabel[i];
mf.append (" ").append (label).appendI (n);
for (var j = n; --j >= 0; ) this.atomLabels.addLast (label);

}
var s = mf.toString ();
this.appendLoadNote (this.ac + " atoms identified for" + s);
this.appendLoadNote (s);
this.asc.newAtomSet ();
this.asc.setAtomSetName (s);
});
Clazz.defineMethod (c$, "readCoordinates", 
 function () {
if (this.discardLinesUntilNonBlank ().toLowerCase ().contains ("selective")) this.rd ();
if (this.line.toLowerCase ().contains ("cartesian")) this.setFractionalCoordinates (false);
for (var i = 0; i < this.ac; i++) this.addAtomXYZSymName (JU.PT.getTokens (this.rd ()), 0, null, this.atomLabels.get (i));

});
});
