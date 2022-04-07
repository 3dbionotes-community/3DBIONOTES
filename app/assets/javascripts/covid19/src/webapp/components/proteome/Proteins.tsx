import { DB } from "./ProteomePath";

interface Protein {
    gen: string;
    name: string;
    domain?: string;
    synonyms?: string;
    pdb?: DB;
    emdb?: DB;
    def?: string;
    description?: string;
}

const build = (type: "pdb" | "emdb", id: string): DB => ({
    id: id,
    img:
        id === "N/A" && id
            ? ""
            : type === "pdb"
            ? `https://www.ebi.ac.uk/pdbe/static/entry/${id.toLowerCase()}_deposited_chain_front_image-200x200.png`
            : `https://www.ebi.ac.uk/pdbe/static/entry/${id}/400_${id.replace("EMD-", "")}.gif`,
});

const proteins: Protein[] = [
    {
        gen: "ORF1a",
        name: "ORF1a",
        def:
            "M408.31,151.89l24.58,88.52-.18.05a276.34,276.34,0,0,0-86.93,41.71A278.93,278.93,0,0,0,275.68,355,276.14,276.14,0,0,0,230.4,491.15q-.5,8.22-.49,16.56a279.07,279.07,0,0,0,1.8,31.7A276.12,276.12,0,0,0,259,631.6a277.46,277.46,0,0,0,25.27,41.12.7.7,0,0,0,.13.17L210.05,728a2.09,2.09,0,0,0-.14-.17,372.72,372.72,0,0,1-33.68-54.86,369.2,369.2,0,0,1,62.6-419.16A370.36,370.36,0,0,1,287.2,211c1.7-1.26,3.41-2.5,5.11-3.71a361.87,361.87,0,0,1,55.41-32.89,369.15,369.15,0,0,1,60.41-22.47Z",
    },
    {
        gen: "ORF1a",
        name: "NSP1",
        synonyms: "NSP1, Non-structural protein 1",
        pdb: build("pdb", "7K7P"),
        def:
            "M403.44,138.77a381.31,381.31,0,0,0-60.73,22.81L327.63,130a415.91,415.91,0,0,1,66.44-24.94Z",
        description:
            "NSP1: Leader protein of 1a and 1ab polyproteins. NSP1 inhibits host cell translation by interacting with the 40S small ribosomal subunit. Slowing down infected host protein production, NSP1 facilitates efficient viral protein translation and evasion from host immune response, thus helping the virus to proliferate.",
    },
    {
        gen: "ORF1a",
        name: "NSP2",
        synonyms: "NSP2, Non-structural protein 2",
        pdb: build("pdb", "7MSW"),
        emdb: build("emdb", "EMD-23970"),
        def:
            "M340.91,162.45a382.64,382.64,0,0,0-55.8,33.05L264.78,167a416.57,416.57,0,0,1,61.05-36.15Z",
        description:
            "NSP2: Although its function is still unknown, NSP2 has been involved in several viral processes. Its highly-conserved Zn2+ binding site suggests that nsp2 binds RNA. It also seems to interact with host infected cell endosomes through cytoskeletal elements and with modulators of translation. ",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        def:
            "M283.48,196.66a383.88,383.88,0,0,0-53.85,47l-25.4-24.06a420.87,420.87,0,0,1,58.92-51.42Z",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "Ubl-1",
        synonyms: "Ubl-1, Ubiquitin-like domain 1",
        pdb: build("pdb", "7TI9"),
        def:
            "M259.8,161.77a425.93,425.93,0,0,0-61.46,53.63l-13.43-12.72a444.45,444.45,0,0,1,64.14-56Z",
        description: "UBL-1: Ubiquitin-like domain 1 of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "MacroDomain",
        synonyms: "MacroDomain, Macrodomain I, Mac1",
        pdb: build("pdb", "5S73"),
        def:
            "M180.45,198.45,167,185.71a470.64,470.64,0,0,1,67.71-59.05l10.75,15.05A449.36,449.36,0,0,0,180.45,198.45Z",
        description:
            "MacroDomain I of NSP3 (Mac1): Domain that recognizes and hydrolizes the ADP-ribose label from proteins associated with the host innate immune response.",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "SUD-N",
        synonyms: "SUD-N, SARS-unique domain N, Macrodomain II, Mac2",
        pdb: build("pdb", "N/A"),
        def:
            "M162.54,181.47l-13.42-12.71a495.28,495.28,0,0,1,71.27-62.17l10.74,15A477.16,477.16,0,0,0,162.54,181.47Z",
        description:
            "SARS-unique domain N of NSP3 (Mac2 ): This domain interacts with the human Paip1 (PABP-interacting protein) and enhances viral protein synthesis.",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "SUD-M",
        synonyms: "SUD-M, SARS-unique domain M, Macrodomain III, Mac3",
        pdb: build("pdb", "N/A"),
        def:
            "M144.65,164.52l-13.42-12.71a518.31,518.31,0,0,1,74.84-65.29l10.74,15A500.19,500.19,0,0,0,144.65,164.52Z",
        description:
            "SARS-unique domain M of NSP3 (Mac3): Domain that interacts with the human Paip1 (PABP-interacting protein) and enhances viral protein synthesis.",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "SUD-C",
        synonyms: "SUD-C, SARS-unique domain C, domain preceding Ubl-2 and PL-Pro, DPUP",
        pdb: build("pdb", "7THH"),
        def:
            "M126.76,147.57l-13.44-12.74a543.67,543.67,0,0,1,78.41-68.37l10.75,15A525.44,525.44,0,0,0,126.76,147.57Z",
        description: "SARS-unique domain C of NSP3 (DPUP).",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "Ubl-2",
        synonyms: "Ubl-2, Ubiquitin-like domain 2",
        pdb: build("pdb", "7THH"),
        description: "UBL-2: Ubiquitin-like domain 2 of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "PL-Pro",
        synonyms: "NSP3, PL-Pro, Papain-like proteinase, Papain-like protease",
        pdb: build("pdb", "7NFV"),
        def:
            "M108.86,130.6,95.43,117.88a568.92,568.92,0,0,1,82-71.49l10.74,15A548.64,548.64,0,0,0,108.86,130.6Z",
        description:
            "PL-Pro: Domain Papain-like proteinase of NSP3. PL-Pro processes proteolytically three cleavage sites located at the N-terminus of the polyproteins 1a and 1ab. In addition, PL-Pro possesses a deubiquitinating/deISGylating activity and processes polyubiquitin chains from cellular substrates. It participates together with NSP4 in the assembly of virally-induced cytoplasmic double-membrane vesicles necessary for viral replication. It also antagonizes innate immune induction of type I interferon by blocking phosphorylation, dimerization and subsequent nuclear translocation of host IRF3. It prevents host cell NF-kappa-B signaling as well.",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "NAB",
        synonyms: "NAB, Nucleic acid binding domain",
        pdb: build("pdb", "7LGO"),
        def:
            "M91,113.64,77.53,100.92a593.56,593.56,0,0,1,85.54-74.61l10.75,15.06A575,575,0,0,0,91,113.64Z",
        description: "NAB: Nucleic acid binding domain of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        domain: "Y3 domain",
        synonyms: "Y3 domain",
        pdb: build("pdb", "7RQG"),
        def:
            "M73.05,96.67l-13-12.29A644.58,644.58,0,0,1,149.2,6.88L159.49,21.3A599.57,599.57,0,0,0,73.05,96.67Z",
        description: "Y3 domain of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "NSP4",
        synonyms: "NSP4, Non-structural protein 4",
        pdb: build("pdb", "N/A"),
        def:
            "M228.25,245.11A384.78,384.78,0,0,0,188,295.88l-29.19-19.29a419.74,419.74,0,0,1,44.08-55.54Z",
        description:
            "NSP4: Protein product involved in the assembly of virally-induced cytoplasmic double-membrane vesicles necessary for viral replication.",
    },
    {
        gen: "ORF1a",
        name: "NSP5",
        synonyms:
            "NSP5, Non-structural protein 5, Main Protease, MPro, 3C-like protease, 3CL-Pro, Main proteinase, 3C-like proteinase",
        pdb: build("pdb", "5R8T"),
        def:
            "M186.86,297.54a383.51,383.51,0,0,0-30.88,57l-32.1-13.93a415.08,415.08,0,0,1,33.79-62.31Z",
        description:
            "NSP5: Protease that processes proteolytically the C-terminus of the polyproteins 1a and 1ab at seven and twelve sites, respectively.",
    },
    {
        gen: "ORF1a",
        name: "NSP6",
        synonyms: "NSP6, Non-structural protein 6",
        pdb: build("pdb", "N/A"),
        def:
            "M155.18,356.33a381.94,381.94,0,0,0-20.45,61.46l-34-8.14a413.4,413.4,0,0,1,22.39-67.24Z",
        description:
            "NSP6: Membrane protein that forms a double-membrane vesicle along with NSP3 and NSP4. At late states of viral infection it inhibits host cell autophagy by reducing autophagosome size, thus preventing innate and adaptive host immune responses.",
    },
    {
        gen: "ORF1a",
        name: "NSP7",
        synonyms: "NSP7, Non-structural protein 7",
        pdb: build("pdb", "7C2K"),
        emdb: build("emdb", "EMD-30275"),
        def:
            "M134.27,419.73a384.42,384.42,0,0,0-9.41,64l-34.92-2.11a416.85,416.85,0,0,1,10.3-70.07Z",
        description:
            "NSP7: As cofactor of NSP12, NSP7 contributes to accomodate the template-product RNA, together with NSP8, in the RNA-dependent RNA polymerase (RdRp) catalytic complex. ",
    },
    {
        gen: "ORF1a",
        name: "NSP8",
        synonyms: "NSP8, Non-structural protein 8",
        pdb: build("pdb", "7C2K"),
        emdb: build("emdb", "EMD-30275"),
        def:
            "M126.48,550.45l-34.77,4a424.38,424.38,0,0,1-2.58-46.73c0-8.1.23-16.18.69-24l34.92,2.11c-.41,7.17-.62,14.55-.62,21.94A387.86,387.86,0,0,0,126.48,550.45Z",
        description:
            "NSP8: As cofactor of NSP12, NSP8 contributes to accomodate the template-product RNA, together with NSP7, in the RNA-dependent RNA polymerase (RdRp) catalytic complex. ",
    },
    {
        gen: "ORF1a",
        name: "NSP9",
        synonyms: "NSP9, Non-structural protein 9",
        pdb: build("pdb", "6WXD"),
        def:
            "M139.6,615.85l-33.56,10a416.92,416.92,0,0,1-14.1-69.38l34.76-4A382.68,382.68,0,0,0,139.6,615.85Z",
        description:
            "NSP9: Able to bind ssRNA, NSP9 forms a covalent RNA-protein intermediate. This RNA is first transferred by the NiRAN domain of NSP12 to NSP9 . Then, the NiRAN NSP12 domain transfers the RNA to GDP to start the building process of the RNA cap structure. Bound to the NSP12 NiRAN domain, NSP9 inhibits the guanylyl tranferase enzymatic activity of NSP12.",
    },
    {
        gen: "ORF1a",
        name: "NSP10",
        synonyms: "NSP10, Non-structural protein 10",
        pdb: build("pdb", "6ZPE"),
        def:
            "M163.92,678l-31.31,15.63a415.33,415.33,0,0,1-26-65.85l33.55-10A381.49,381.49,0,0,0,163.92,678Z",
        description:
            "NSP10: Stimulating both NSP14 exoribonuclease and NSP16 methyltransferase activities, NSP10 plays an essential role in viral mRNA proofreading and cap methylation.",
    },
    {
        gen: "ORF1a",
        name: "NSP11",
        synonyms: "NSP11, Non-structural protein 11",
        pdb: build("pdb", "N/A"),
        def:
            "M198.69,734.85l-28.13,20.83a419.24,419.24,0,0,1-37.06-60.31l31.31-15.63A383.18,383.18,0,0,0,198.69,734.85Z",
        description: "NSP11: Non-structural protein 11. ",
    },
    {
        gen: "ORF1b",
        name: "ORF1b",
        def:
            "M819.07,706.39c-1.13,1.8-2.3,3.6-3.49,5.38A369.58,369.58,0,0,1,313.86,823c-3.58-2.2-7.12-4.45-10.64-6.78-38.84-25.66-65.47-50.89-93.17-88.29l74.39-55.07a279,279,0,0,0,77.73,71.27,277,277,0,0,0,145.14,41,279.17,279.17,0,0,0,59.74-6.45,275.75,275.75,0,0,0,97.19-42.19,279,279,0,0,0,74.36-75.58q1.33-2,2.63-4Z",
    },
    {
        gen: "ORF1b",
        name: "NSP12",
        synonyms:
            "NSP12, Non-structural protein 12, RNA-directed RNA polymerase, RNA-dependent RNA polymerase, RdRp",
        pdb: build("pdb", "7C2K"),
        emdb: build("emdb", "EMD-30275"),
        def:
            "M306.06,833.85l-18.29,29.84a418,418,0,0,1-116-106.4l28.13-20.83A382.74,382.74,0,0,0,306.06,833.85Z",
        description:
            "NSP12: As main component of the replication-transcription complex (RTC), NSP12 catalyzes the synthesis of complementary RNA (negative) using the positive RNA as template, as well as the synthesis of mRNA starting from the complementary negative RNA as template. With a second enzymatic activity of the NSP12,  guanylyl tranferase from the NiRAN domain, also contributes to the mRNA cap synthesis.",
    },
    {
        gen: "ORF1b",
        name: "NSP13",
        synonyms: "NSP13, Non-structural protein 13, Helicase",
        pdb: build("pdb", "5ROB"),
        def:
            "M442.76,885.49,437,920a414,414,0,0,1-147.51-55.26l18.28-29.84A379.27,379.27,0,0,0,442.76,885.49Z",
        description:
            "NSP13: Its helicase RNA duplex-unwinding activity contributes to elongate the RNA product. Additionally, its fosfatase activity catalizes the first step of the mRNA cap synthesis.",
    },
    {
        gen: "ORF1b",
        name: "NSP14",
        synonyms:
            "NSP14, Non-structural protein 14, Proofreading exoribonuclease, 3'-5' exoribonuclease, N7 methyltransferase, ExoN/N7-MTase",
        pdb: build("pdb", "5SMK"),
        def:
            "M596.58,916.33a422.15,422.15,0,0,1-157.62,4l5.77-34.51A386.94,386.94,0,0,0,589,882.16Z",
        description:
            "NSP14: Enzyme with two different catalytic activities: Exoribonuclease activity in its N-terminal end, and N7-methyltransferase activity in its C-terminal end. Its proofreading exoribonuclease lowers viral sensitivity to nucleoside analogs.",
    },
    {
        gen: "ORF1b",
        name: "NSP15",
        synonyms:
            "NSP15, Non-structural protein 15, Endoribonuclease, Uridylate-specific endoribonuclease, Endornase, NendoU",
        pdb: build("pdb", "5SBF"),
        def:
            "M743.23,853a414.29,414.29,0,0,1-144.7,62.87L591,881.73A379.27,379.27,0,0,0,723.39,824.2Z",
        description:
            "NSP15: As uridylate-specific enzyme, NSP15 hydrolizes both ssRNA and dsRNA, probably to avoid trigger the host inmune response.",
    },
    {
        gen: "ORF1b",
        name: "NSP16",
        synonyms: "NSP16, Non-structural protein 16, 2'-O-methyltransferase",
        pdb: build("pdb", "7L6T"),
        def:
            "M859.5,733.27A420.49,420.49,0,0,1,744.88,851.89L725,823.06A382.58,382.58,0,0,0,830,714.5Z",
        description:
            "NSP16: Methyltransferase that catalyzes the last reaction to build the viral mRNA cap, the methylation of the ribose 2'-OH. ",
    },
    {
        gen: "Remaining",
        name: "Spike",
        synonyms: "Spike, Protein S, Spike glycoprotein, Surface Glycoprotein",
        pdb: build("pdb", "6VSB"),
        emdb: build("emdb", "EMD-21375"),
        def:
            "M819.07,706.39l-77.84-49.51A278.23,278.23,0,0,0,781.7,466.8l91.17-13.67C886.36,543.25,868,629.89,819.07,706.39Z",
        description:
            "Spike: Decorating surface glycoprotein that protrudes from the viral outer membrane. Several conformational changes allow its interaction with the host receptor ACE2 and membrane fusion, thus initiating the infection. ",
    },
    {
        gen: "Remaining",
        name: "ORF3",
        synonyms: "ORF3, ORF3a, Accessory protein 3a,  Protein U274, Protein X1",
        pdb: build("pdb", "6XDC"),
        emdb: build("emdb", "EMD-22136"),
        def:
            "M872.87,453.13,781.7,466.8a274.38,274.38,0,0,0-11.24-47l87.35-29.27A343.24,343.24,0,0,1,872.87,453.13Z",
        description:
            "ORF3: As a viroporin, ORF3 forms cellular dimeric nonselective Ca2+ permeable cation channels that become active by oligomerizing into tetramers or higher-order oligomers. This channel activity in cells could be relevant to promote viral maturation through inhibition of autophagy and disruption of lysosomes.",
    },
    {
        gen: "Remaining",
        name: "Envelope Protein",
        synonyms:
            "Protein E, Envelope small membrane protein, Protein E. Envelope membrane protein",
        pdb: build("pdb", "7NTK"),
        def:
            "M857.81,390.5l-87.35,29.27q-3.84-11.53-8.67-22.61l84.45-36.75C850.88,371.09,854.11,379.48,857.81,390.5Z",
        description:
            "Protein E: Envelope small membrane protein. As a viroporin, it self-assembles in host membranes forming pentameric protein pores that can affect the integrity of the lipid bilayer or disrupt the membrane potential, thus facilitating the release of viral particles from host cells.",
    },
    {
        gen: "Remaining",
        name: "Membrane Protein",
        synonyms: "Protein M, Membrane protein",
        pdb: build("pdb", "N/A"),
        def:
            "M846.24,360.41l-84.45,36.75q-4.85-11.13-10.61-21.75l80.91-44C837.65,341.67,841.6,349.74,846.24,360.41Z",
        description:
            "Protein M: Membrane protein. Abundant transmembrane component of the viral envelope that functions as a  organizational hub for virion assembly through its binding to the Spike and Nucleocapsid proteins in the outer and inner membrane surface, respectively. ",
    },
    {
        gen: "Remaining",
        name: "ORF6",
        synonyms: "ORF6, Accessory Protein 6, Accessory Factor 6",
        pdb: build("pdb", "7VPH"),
        def:
            "M832.09,331.45l-80.91,44q-5.79-10.67-12.49-20.75l76.78-50.84C821.9,313.51,826.53,321.23,832.09,331.45Z",
        description:
            "ORF6: Although it is ot necessary for viral invasion and replication, ORF6 plays a relevant role in immune evasion. It directly interacts with the host complex Rae1-Nup98 preventing the nuclear export of host mRNA, antagonizing interferon signaling.",
    },
    {
        gen: "Remaining",
        name: "ORF7a",
        synonyms: "ORF7a Protein, Accessory protein 7a",
        pdb: build("pdb", "7CI3"),
        def:
            "M815.47,303.82l-76.78,50.84q-6.69-10.11-14.24-19.57l72.06-57.34C803.75,286.84,809.05,294.12,815.47,303.82Z",
        description:
            "ORF7a: Although dispensable for virus replication in cell culture, ORF7a acts as a immunomodulator factor that binds to immune cells and triggers inflammatory responses.",
    },
    {
        gen: "Remaining",
        name: "ORF7b",
        synonyms: "ORF7b, Accessory protein 7b",
        pdb: build("pdb", "N/A"),
        def:
            "M796.51,277.75l-72.06,57.34a274.41,274.41,0,0,0-19.24-21.76l65.65-64.54C779,257.08,789.26,268.65,796.51,277.75Z",
        description: "ORF7b: Small accessory protein 7b.",
    },
    {
        gen: "Remaining",
        name: "ORF8",
        synonyms: "ORF8, Non-structural protein 8",
        pdb: build("pdb", "7F5F"),
        def:
            "M770.86,248.79l-65.65,64.54q-8.49-8.64-17.71-16.52l59.76-70C756.11,234.36,762.69,240.5,770.86,248.79Z",
        description:
            "ORF8: With a core fold similar to ORF7a, the structure of ORF8 reveals two novel dimer interfaces that allow forming host large-scale assemblies, potentially mediating immune suppression and evasion activities.",
    },
    {
        gen: "Nucleoprotein",
        name: "Nucleoprotein",
        def:
            "M747.26,226.82l-59.76,70a277.6,277.6,0,0,0-60.75-39.53l39.55-83C697.82,189.32,720.7,204.16,747.26,226.82Z",
    },
    {
        gen: "Nucleoprotein",
        name: "Nucleoprotein",
        domain: "NTD",
        synonyms:
            "Nucleoprotein N-terminal domain, Nucleocapsid N-terminal domain, N-NTD, ribonucleocapsid N-terminal domain , RNP N-terminal domain, Nucleoprotein RNA binding domain, Nucleocapsid RNA binding domain",
        pdb: build("pdb", "7CDZ"),
        description:
            "Nucleoprotein N-terminal domain: The nucleoprotein (N protein) is involved in viral assembly, replication and host immune response regulation. Its N-terminal domain (N-NTD) is responsible for RNA binding and packaging of the positive strand viral genome RNA into a helical ribonucleocapsid (RNP).",
    },
    {
        gen: "Nucleoprotein",
        name: "Nucleoprotein",
        domain: "CTD",
        synonyms:
            "Nucleoprotein C-terminal domain, Nucleocapsid C-terminal domain, N-CTD, ribonucleocapsid C-terminal domain , RNP C-terminal domain, Nucleoprotein dimerization domain, Nucleocapsid dimerization domain",
        pdb: build("pdb", "7CE0"),
        description:
            "Nucleoprotein C-terminal domain: The nucleoprotein (N protein) is involved in viral assembly, replication and host immune response regulation. Its C-terminal domain (N-CTD) is responsible for RNA binding and packaging of the positive strand viral genome RNA into a helical ribonucleocapsid (RNP).",
    },
    {
        gen: "Remaining",
        name: "ORF9b",
        synonyms: "ORF9b, Protein 9b",
        pdb: build("pdb", "7KDT"),
        emdb: build("emdb", "EMD-22829"),
        def:
            "M666.3,174.32l-39.55,83q-10.92-5.22-22.32-9.48l32.17-86.07C647.51,165.8,655.79,169.31,666.3,174.32Z",
        description:
            "ORF9b: The gene encoding this small protein overlaps the N gene. ORF9b protein interacts and blocks the substrate binding site of the host Tom70, import receptor of the translocase from the mitochondrial outer membrane (TOM) complex, involved in the activation of the mitochondrial antiviral signaling leading to apoptosis upon viral infection. In addition, ORF9b may modulate interferon and apoptosis signaling avoiding the interaction between Tom70 and Hsp70 and Hsp90 chaperones.",
    },
    {
        gen: "Remaining",
        name: "ORF10",
        synonyms: "ORF10, Hypothetical ORF10 Protein.",
        pdb: build("pdb", "N/A"),
        def:
            "M636.6,161.73,604.43,247.8q-11.29-4.23-23-7.48l24.53-88.54C617.14,154.89,625.7,157.66,636.6,161.73Z",
        description: "Hypothetical ORF10 Protein.",
    },
];

const protWithDetails = proteins.map(prot => ({
    name: prot.name,
    def: prot.def,
    details: {
        gen: prot.gen,
        synonyms: prot.synonyms,
        domain: prot.domain,
        description: prot.description,
        pdb: prot.pdb,
        emdb: prot.emdb,
    },
}));

export const Orf1a = protWithDetails.filter(prot => prot.details.gen === "ORF1a");
export const Orf1b = protWithDetails.filter(prot => prot.details.gen === "ORF1b");
export const Nucleoprotein = protWithDetails.filter(prot => prot.details.gen === "Nucleoprotein");
export const Remaining = protWithDetails.filter(prot => prot.details.gen === "Remaining");
