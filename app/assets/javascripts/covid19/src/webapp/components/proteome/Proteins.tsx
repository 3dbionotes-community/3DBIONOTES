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
            "M405.25,159.44l23.53,84.72c-.06,.01-.12,.02-.18,.05-15.03,4.19-29.52,9.66-43.36,16.31-14.01,6.71-27.33,14.63-39.84,23.61-13.83,9.94-26.67,21.15-38.34,33.49-10.6,11.2-20.23,23.33-28.76,36.25-8.47,12.83-15.86,26.43-22.03,40.69-6.09,14.03-11,28.7-14.58,43.87-3.53,14.8-5.81,30.08-6.71,45.72-.32,5.24-.47,10.53-.47,15.85,0,10.25,.58,20.38,1.72,30.34,1.76,15.53,4.86,30.66,9.2,45.26,4.41,14.92,10.11,29.28,16.96,42.98,6.93,13.85,15.03,27.01,24.18,39.35,.04,.06,.08,.12,.13,.17l-71.2,52.71c-.04-.06-.08-.11-.13-.17-12.45-16.83-23.19-34.41-32.24-52.51-9.31-18.62-16.85-37.81-22.62-57.32-5.89-19.87-9.96-40.07-12.26-60.39-2.32-20.51-2.83-41.11-1.57-61.6,1.26-20.53,4.31-40.92,9.11-60.94,4.76-19.97,11.27-39.54,19.48-58.48,8.13-18.77,17.94-36.92,29.37-54.21,11.22-16.99,24.04-33.15,38.4-48.25,13.97-14.71,29.42-28.43,46.3-40.92,1.63-1.2,3.26-2.4,4.89-3.55,17.17-12.31,34.68-22.73,53.04-31.48,18.29-8.72,37.39-15.82,57.82-21.5,.06-.01,.11-.04,.17-.05Z",
    },
    {
        gen: "ORF1a",
        name: "NSP1",
        synonyms: "NSP1, Non-structural protein 1",
        pdb: build("pdb", "7K7P"),
        def:
            "M400.31,146.73c-19.76,5.56-39.19,12.85-57.75,21.69l-14.24-29.83c20.3-9.65,41.52-17.63,63.14-23.71l8.85,31.85Z",
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
            "M340.44,169.43c-18.47,8.92-36.3,19.49-53.06,31.42l-19.2-26.89c18.29-13.04,37.8-24.59,58.02-34.35l14.24,29.82Z",
        description:
            "NSP2: Although its function is still unknown, NSP2 has been involved in several viral processes. Its highly-conserved Zn2+ binding site suggests that nsp2 binds RNA. It also seems to interact with host infected cell endosomes through cytoskeletal elements and with modulators of translation. ",
    },
    {
        gen: "ORF1a",
        name: "NSP3",
        def:
            "M285.46,202.24c-18.41,13.29-35.64,28.32-51.25,44.72l-23.99-22.73c17.09-17.96,35.93-34.4,56.04-48.89l19.2,26.89Z",
    },
    {
        gen: "ORF1a",
        name: "Ubl-1",
        domain: "NSP3",
        synonyms: "Ubl-1, Ubiquitin-like domain 1",
        pdb: build("pdb", "7TI9"),
        def:
            "M263.1,168.89c-21.23,15.21-40.92,32.4-58.82,51.33l-12.85-12.18c18.68-19.74,39.23-37.69,61.38-53.55l10.29,14.4Z",
        description: "UBL-1: Ubiquitin-like domain 1 of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "MacroDomain",
        domain: "NSP3",
        synonyms: "MacroDomain, Macrodomain I, Mac1",
        pdb: build("pdb", "5S73"),
        def:
            "M187.16,204l-12.86-12.19c19.73-20.84,41.43-39.78,64.81-56.52l10.29,14.41c-22.47,16.08-43.31,34.28-62.23,54.3Z",
        description:
            "MacroDomain I of NSP3 (Mac1): Domain that recognizes and hydrolizes the ADP-ribose label from proteins associated with the host innate immune response.",
    },
    {
        gen: "ORF1a",
        name: "SUD-N",
        domain: "NSP3",
        synonyms: "SUD-N, SARS-unique domain N, Macrodomain II, Mac2",
        pdb: build("pdb", "N/A"),
        def:
            "M170.01,187.75l-12.84-12.17c20.76-21.94,43.6-41.88,68.22-59.51l10.28,14.41c-23.68,16.97-45.67,36.16-65.66,57.27Z",
        description:
            "SARS-unique domain N of NSP3 (Mac2 ): This domain interacts with the human Paip1 (PABP-interacting protein) and enhances viral protein synthesis.",
    },
    {
        gen: "ORF1a",
        name: "SUD-M",
        domain: "NSP3",
        synonyms: "SUD-M, SARS-unique domain M, Macrodomain III, Mac3",
        pdb: build("pdb", "N/A"),
        def:
            "M152.89,171.52l-12.84-12.17c21.78-23.03,45.77-43.98,71.63-62.49l10.28,14.41c-24.92,17.84-48.05,38.04-69.07,60.25Z",
        description:
            "SARS-unique domain M of NSP3 (Mac3): Domain that interacts with the human Paip1 (PABP-interacting protein) and enhances viral protein synthesis.",
    },
    {
        gen: "ORF1a",
        name: "SUD-C",
        domain: "NSP3",
        synonyms: "SUD-C, SARS-unique domain C, domain preceding Ubl-2 and PL-Pro, DPUP",
        pdb: build("pdb", "7THH"),
        def:
            "M135.77,155.3l-12.86-12.19c22.84-24.13,47.97-46.07,75.05-65.44l10.29,14.4c-26.16,18.74-50.43,39.93-72.48,63.24Z",
        description: "SARS-unique domain C of NSP3 (DPUP).",
    },
    {
        gen: "ORF1a",
        name: "Ubl-2",
        domain: "NSP3",
        synonyms: "Ubl-2, Ubiquitin-like domain 2",
        pdb: build("pdb", "7THH"),
        def:
            "M118.64,139.06l-12.85-12.18c23.87-25.23,50.15-48.16,78.46-68.43l10.28,14.4c-27.39,19.61-52.8,41.8-75.89,66.21Z",
        description: "UBL-2: Ubiquitin-like domain 2 of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "PL-Pro",
        domain: "NSP3",
        synonyms: "NSP3, PL-Pro, Papain-like proteinase, Papain-like protease",
        pdb: build("pdb", "7NFV"),
        def:
            "M101.5,122.82l-12.85-12.18c24.91-26.33,52.33-50.26,81.87-71.4l10.29,14.41c-28.61,20.5-55.18,43.67-79.31,69.17Z",
        description:
            "PL-Pro: Domain Papain-like proteinase of NSP3. PL-Pro processes proteolytically three cleavage sites located at the N-terminus of the polyproteins 1a and 1ab. In addition, PL-Pro possesses a deubiquitinating/deISGylating activity and processes polyubiquitin chains from cellular substrates. It participates together with NSP4 in the assembly of virally-induced cytoplasmic double-membrane vesicles necessary for viral replication. It also antagonizes innate immune induction of type I interferon by blocking phosphorylation, dimerization and subsequent nuclear translocation of host IRF3. It prevents host cell NF-kappa-B signaling as well.",
    },
    {
        gen: "ORF1a",
        name: "NAB",
        domain: "NSP3",
        synonyms: "NAB, Nucleic acid binding domain",
        pdb: build("pdb", "7LGO"),
        def:
            "M84.37,106.59l-12.41-11.76c24.87-26.22,55.86-53.17,85.29-74.17l9.85,13.79c-29.85,21.37-57.56,45.55-82.73,72.15Z",
        description: "NAB: Nucleic acid binding domain of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "Y3 domain",
        domain: "NSP3",
        synonyms: "Y3 domain",
        pdb: build("pdb", "7RQG"),
        def:
            "M153.38,15.24c-12.81,9.17-25.25,18.84-37.29,28.99-5.1,4.3-10.11,8.67-15.06,13.15-11.71,10.54-22.97,21.55-33.81,32.99l-12.85-12.18c10.82-11.43,22.09-22.46,33.76-33.04,5.78-5.24,11.66-10.37,17.64-15.36,12.05-10.14,24.5-19.8,37.31-28.96l10.29,14.41Z",
        description: "Y3 domain of NSP3.",
    },
    {
        gen: "ORF1a",
        name: "NSP4",
        synonyms: "NSP4, Non-structural protein 4",
        pdb: build("pdb", "N/A"),
        def:
            "M232.6,248.67c-14.1,15-26.99,31.22-38.31,48.26l-27.56-18.21c12.4-18.67,26.49-36.41,41.89-52.78l23.99,22.73Z",
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
            "M192.99,298.9c-11.27,17.16-21.15,35.36-29.37,54.16l-30.3-13.16c8.99-20.58,19.79-40.49,32.1-59.21l27.58,18.21Z",
        description:
            "NSP5: Protease that processes proteolytically the C-terminus of the polyproteins 1a and 1ab at seven and twelve sites, respectively.",
    },
    {
        gen: "ORF1a",
        name: "NSP6",
        synonyms: "NSP6, Non-structural protein 6",
        pdb: build("pdb", "N/A"),
        def:
            "M162.69,355.23c-8.11,18.84-14.64,38.49-19.45,58.43l-32.14-7.68c5.25-21.81,12.4-43.29,21.28-63.9l30.31,13.15Z",
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
            "M142.7,415.96c-4.66,19.88-7.67,40.36-8.96,60.89l-32.97-1.99c1.37-22.42,4.66-44.82,9.78-66.58l32.14,7.68Z",
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
            "M135.26,540.71l-32.84,3.76c-1.62-14.63-2.44-29.59-2.44-44.47,0-7.67,.21-15.33,.65-22.79l32.97,1.99c-.38,6.8-.58,13.78-.58,20.79,0,13.58,.76,27.27,2.24,40.71Z",
        description:
            "NSP8: As cofactor of NSP12, NSP8 contributes to accomodate the template-product RNA, together with NSP7, in the RNA-dependent RNA polymerase (RdRp) catalytic complex. ",
    },
    {
        gen: "ORF1a",
        name: "NSP9",
        synonyms: "NSP9, Non-structural protein 9",
        pdb: build("pdb", "6WXD"),
        def:
            "M147.78,603.36l-31.68,9.4c-6.3-21.48-10.81-43.64-13.4-65.94l32.83-3.76c2.38,20.38,6.5,40.65,12.26,60.3Z",
        description:
            "NSP9: Able to bind ssRNA, NSP9 forms a covalent RNA-protein intermediate. This RNA is first transferred by the NiRAN domain of NSP12 to NSP9 . Then, the NiRAN NSP12 domain transfers the RNA to GDP to start the building process of the RNA cap structure. Bound to the NSP12 NiRAN domain, NSP9 inhibits the guanylyl tranferase enzymatic activity of NSP12.",
    },
    {
        gen: "ORF1a",
        name: "NSP10",
        synonyms: "NSP10, Non-structural protein 10",
        pdb: build("pdb", "6ZPE"),
        def:
            "M171.04,662.84l-29.57,14.76c-9.98-20.11-18.29-41.15-24.71-62.59l31.69-9.4c5.86,19.58,13.46,38.82,22.59,57.23Z",
        description:
            "NSP10: Stimulating both NSP14 exoribonuclease and NSP16 methyltransferase activities, NSP10 plays an essential role in viral mRNA proofreading and cap methylation.",
    },
    {
        gen: "ORF1a",
        name: "NSP11",
        synonyms: "NSP11, Non-structural protein 11",
        pdb: build("pdb", "N/A"),
        def:
            "M204.3,717.36l-26.56,19.67c-13.33-18.1-25.18-37.37-35.22-57.31l29.57-14.76c9.2,18.25,20.04,35.88,32.21,52.4Z",
        description: "NSP11: Non-structural protein 11. ",
    },
    {
        gen: "ORF1b",
        name: "ORF1b",
        def:
            "M798.4,690.16c-1.09,1.72-2.21,3.45-3.34,5.16-25.9,39.14-58.26,71.47-94.72,96.5-37.78,25.94-79.99,44.04-124.02,53.77-44.06,9.76-89.94,11.13-135.05,3.59-43.66-7.29-86.59-22.93-126.43-47.38-3.42-2.1-6.81-4.26-10.18-6.49-37.17-24.56-62.66-48.71-89.17-84.5l71.2-52.71c20.19,27.2,45.45,50.4,74.4,68.22,28.49,17.51,60.52,29.81,94.79,35.53,14.35,2.41,29.09,3.66,44.12,3.66,19.64,0,38.77-2.14,57.18-6.17,33.89-7.45,65.35-21.35,93.02-40.38,28.11-19.32,52.31-43.91,71.18-72.33,.85-1.27,1.69-2.56,2.51-3.85l74.51,47.39Z",
    },
    {
        gen: "ORF1b",
        name: "NSP12",
        synonyms:
            "NSP12, Non-structural protein 12, RNA-directed RNA polymerase, RNA-dependent RNA polymerase, RdRp",
        pdb: build("pdb", "7C2K"),
        emdb: build("emdb", "EMD-30275"),
        def:
            "M307.08,812.23l-17.28,28.18c-43.12-26.68-80.35-60.82-110.66-101.48l26.56-19.67c27.79,37.26,61.88,68.53,101.37,92.97Z",
        description:
            "NSP12: As main component of the replication-transcription complex (RTC), NSP12 catalyzes the synthesis of complementary RNA (negative) using the positive RNA as template, as well as the synthesis of mRNA starting from the complementary negative RNA as template. With a second enzymatic activity of the NSP12,  guanylyl tranferase from the NiRAN domain, also contributes to the mRNA cap synthesis.",
    },
    {
        gen: "ORF1b",
        name: "NSP13",
        synonyms: "NSP13, Non-structural protein 13, Helicase",
        pdb: build("pdb", "5ROB"),
        def:
            "M437.97,861.76l-5.45,32.59c-50.02-8.51-97.34-26.23-140.69-52.71l17.26-28.18c39.7,24.24,83.04,40.49,128.88,48.3Z",
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
            "M585.18,890.93c-27.81,6.03-56.46,9.09-85.18,9.09-21.87,0-43.78-1.77-65.16-5.27l5.45-32.59c19.6,3.2,39.68,4.83,59.71,4.83,26.29,0,52.53-2.8,78.02-8.32l7.16,32.27Z",
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
            "M725.5,830.45c-42.03,28.74-88.45,48.92-138.01,59.98l-7.16-32.27c45.37-10.12,87.91-28.59,126.44-54.93l18.74,27.22Z",
        description:
            "NSP15: As uridylate-specific enzyme, NSP15 hydrolizes both ssRNA and dsRNA, probably to avoid trigger the host inmune response.",
    },
    {
        gen: "ORF1b",
        name: "NSP16",
        synonyms: "NSP16, Non-structural protein 16, 2'-O-methyltransferase",
        pdb: build("pdb", "7L6T"),
        def:
            "M836.78,715.96c-28.78,44.78-65.56,82.85-109.34,113.15l-18.74-27.22c40.11-27.77,73.81-62.63,100.17-103.66l27.91,17.74Z",
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
            "M798.4,690.16l-74.51-47.39c26.34-41.23,41.61-90.21,41.61-142.77,0-13.3-.98-26.37-2.87-39.15l87.26-13.09c12.91,86.26-4.71,169.18-51.5,242.4Z",
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
            "M849.89,447.76l-87.26,13.09c-2.29-15.48-5.91-30.53-10.76-45.02l83.6-28.01c7.07,21.12,11.12,37.93,14.42,59.94Z",
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
            "M835.47,387.82l-83.6,28.01c-2.45-7.36-5.23-14.58-8.3-21.64l80.83-35.18c4.44,10.22,7.53,18.25,11.07,28.8Z",
        description:
            "Protein E: Envelope small membrane protein. As a viroporin, it self-assembles in host membranes forming pentameric protein pores that can affect the integrity of the lipid bilayer or disrupt the membrane potential, thus facilitating the release of viral particles from host cells.",
    },
    {
        gen: "Remaining",
        name: "Membrane Protein",
        synonyms: "Protein M, Membrane protein",
        pdb: build("pdb", "N/A"),
        def:
            "M824.41,359.01l-80.83,35.18c-3.09-7.1-6.48-14.05-10.16-20.82l77.44-42.08c5.32,9.78,9.1,17.51,13.55,27.72Z",
        description:
            "Protein M: Membrane protein. Abundant transmembrane component of the viral envelope that functions as a  organizational hub for virion assembly through its binding to the Spike and Nucleocapsid proteins in the outer and inner membrane surface, respectively. ",
    },
    {
        gen: "Remaining",
        name: "ORF6",
        synonyms: "ORF6, Accessory Protein 6, Accessory Factor 6",
        pdb: build("pdb", "7VPH"),
        def:
            "M810.86,331.3l-77.44,42.08c-3.69-6.81-7.68-13.43-11.95-19.86l73.49-48.66c6.15,9.27,10.58,16.66,15.91,26.44Z",
        description:
            "ORF6: Although it is ot necessary for viral invasion and replication, ORF6 plays a relevant role in immune evasion. It directly interacts with the host complex Rae1-Nup98 preventing the nuclear export of host mRNA, antagonizing interferon signaling.",
    },
    {
        gen: "Remaining",
        name: "ORF7a",
        synonyms: "ORF7a Protein, Accessory protein 7a",
        pdb: build("pdb", "7CI3"),
        def:
            "M794.95,304.85l-73.49,48.66c-4.27-6.45-8.81-12.7-13.63-18.74l68.97-54.88c6.93,8.71,12,15.67,18.15,24.96Z",
        description:
            "ORF7a: Although dispensable for virus replication in cell culture, ORF7a acts as a immunomodulator factor that binds to immune cells and triggers inflammatory responses.",
    },
    {
        gen: "Remaining",
        name: "ORF7b",
        synonyms: "ORF7b, Accessory protein 7b",
        pdb: build("pdb", "N/A"),
        def:
            "M776.8,279.89l-68.97,54.88c-5.77-7.27-11.93-14.22-18.42-20.83l62.83-61.77c7.81,7.94,17.62,19.01,24.56,27.72Z",
        description: "ORF7b: Small accessory protein 7b.",
    },
    {
        gen: "Remaining",
        name: "ORF8",
        synonyms: "ORF8, Non-structural protein 8",
        pdb: build("pdb", "7F5F"),
        def:
            "M752.25,252.18l-62.83,61.77c-5.42-5.51-11.07-10.79-16.94-15.81l57.19-66.99c8.47,7.22,14.77,13.1,22.59,21.03Z",
        description:
            "ORF8: With a core fold similar to ORF7a, the structure of ORF8 reveals two novel dimer interfaces that allow forming host large-scale assemblies, potentially mediating immune suppression and evasion activities.",
    },
    {
        gen: "Nucleoprotein",
        name: "Nucleoprotein",
        def:
            "M729.66,231.15l-57.19,66.99c-17.55-15.01-37.09-27.77-58.15-37.83l37.85-79.4c30.17,14.36,52.07,28.56,77.49,50.24Z",
    },
    {
        gen: "Nucleoprotein",
        name: "NTD",
        domain: "Nucleoprotein",
        synonyms:
            "Nucleoprotein N-terminal domain, Nucleocapsid N-terminal domain, N-NTD, ribonucleocapsid N-terminal domain , RNP N-terminal domain, Nucleoprotein RNA binding domain, Nucleocapsid RNA binding domain",
        pdb: build("pdb", "7CDZ"),
        def:
            "M758.74,195.35l-21.25,24.89c-12.34-10.5-25.54-20.28-39.24-29.1l17.56-27.56c15.13,9.7,29.19,20.12,42.93,31.78Z",
        description:
            "Nucleoprotein N-terminal domain: The nucleoprotein (N protein) is involved in viral assembly, replication and host immune response regulation. Its N-terminal domain (N-NTD) is responsible for RNA binding and packaging of the positive strand viral genome RNA into a helical ribonucleocapsid (RNP).",
    },
    {
        gen: "Nucleoprotein",
        name: "CTD",
        domain: "Nucleoprotein",
        synonyms:
            "Nucleoprotein C-terminal domain, Nucleocapsid C-terminal domain, N-CTD, ribonucleocapsid C-terminal domain , RNP C-terminal domain, Nucleoprotein dimerization domain, Nucleocapsid dimerization domain",
        pdb: build("pdb", "7CE0"),
        def:
            "M713.82,162.31l-17.56,27.55c-11.95-7.59-24.43-14.51-37.12-20.63l14.05-29.45c15.98,7.66,25.78,13.1,40.63,22.53Z",
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
            "M652.17,180.9l-37.85,79.4c-6.96-3.33-14.08-6.36-21.36-9.07l30.79-82.38c10.44,3.89,18.37,7.26,28.43,12.05Z",
        description:
            "ORF9b: The gene encoding this small protein overlaps the N gene. ORF9b protein interacts and blocks the substrate binding site of the host Tom70, import receptor of the translocase from the mitochondrial outer membrane (TOM) complex, involved in the activation of the mitochondrial antiviral signaling leading to apoptosis upon viral infection. In addition, ORF9b may modulate interferon and apoptosis signaling avoiding the interaction between Tom70 and Hsp70 and Hsp90 chaperones.",
    },
    {
        gen: "Remaining",
        name: "ORF10",
        synonyms: "ORF10, Hypothetical ORF10 Protein.",
        pdb: build("pdb", "N/A"),
        def:
            "M623.75,168.86l-30.79,82.38c-7.21-2.7-14.56-5.09-22.05-7.16l23.48-84.74c10.74,2.97,18.93,5.63,29.36,9.52Z",
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
