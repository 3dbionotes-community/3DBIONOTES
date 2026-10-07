import { rest } from "msw";
import { DbModel } from "../domain/entities/DbModel";

const baseUrl = process.env.REACT_APP_BWS || "https://3dbionotes.cnb.csic.es";

// Tus datos falsos aquí...
const mockDbModels: DbModel[] = [
    {
        id: "4HHB",
        type: "pdb",
        score: 0.98,
        name: "THE CRYSTAL STRUCTURE OF HUMAN DEOXYHEMOGLOBIN",
        authors: "Fermi, G., Perutz, M.F.",
        method: "X-RAY DIFFRACTION",
        resolution: "1.74 Å",
        imageUrl: "https://www.ebi.ac.uk/pdbe/static/entry/4hhb_deposited_2500_1-600x600.png",
        url: "https://www.rcsb.org/structure/4HHB",
        specimenState: undefined,
    },
];

export const handlers = [
    rest.get(`${baseUrl}/ws/api/search`, (req, res, ctx) => {
        const query = (req.url.searchParams.get("query") || "").toLowerCase();

        const filteredItems = mockDbModels.filter(
            item =>
                item.id.toLowerCase().includes(query) ||
                (item.name && item.name.toLowerCase().includes(query))
        );

        const pdbCount = filteredItems.filter(item => item.type === "pdb").length;
        const emdbCount = filteredItems.filter(item => item.type === "emdb").length;

        // Sintaxis de respuesta en v1
        return res(
            ctx.delay(300),
            ctx.json({
                totals: {
                    pdb: pdbCount,
                    emdb: emdbCount,
                },
                items: filteredItems,
            })
        );
    }),
];
