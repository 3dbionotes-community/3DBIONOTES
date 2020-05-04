/* Global variables:

    declare const proteinsData: {
        proteins: Record<string, Protein>,
        relations: Record<string, string[]>,
    }
*/

$(initLiveSearch);

function initLiveSearch() {
    const allProteins = proteinsData.proteins;
    const relations = proteinsData.relations;

    $("#search-protein").keyup((ev) => {
        const text = $(ev.currentTarget).val().toLowerCase().trim();

        if (!text) {
            clearSearch();
        } else {
            hideProteinsAndRemoveItemHighlights();
            processProteinMatches(allProteins, text) ||
                processItemMatches(relations, text) ||
                showNoMatches(true);
        }
    });
}

function processProteinMatches(allProteins, text) {
    const includesText = (name) => name.toLowerCase().includes(text);
    const proteinNames = allProteins
        .filter((protein) => [protein.name, ...protein.names].some(includesText))
        .map((protein) => protein.name);

    if (proteinNames.length === 0) {
        return false;
    } else {
        showNoMatches(false);
        showProteins(proteinNames);
        return true;
    }
}

function processItemMatches(relations, text) {
    const items = Object.keys(relations).filter((key) => key.toLowerCase().includes(text));

    if (items.length === 0) {
        return false;
    } else {
        const proteins = flatten(
            items.map((item) => {
                const itemsCssClasses = items.map((name) => ".item-" + name);
                $(itemsCssClasses.join(",")).addClass("hl");
                return relations[item];
            })
        );

        showNoMatches(false);
        showProteins(proteins);

        proteins.forEach((protein) => {
            $(`.protein-${protein} .card`).each((_idx, cardEl) => {
                const card = $(cardEl);
                const hasMatches = card.find(".hl").size() > 0;
                setCollapsables(card, hasMatches);
            });
        });

        return true;
    }
}

function showProteins(proteinNames) {
    const proteinsCssClasses = uniq(proteinNames.map((key) => ".protein-" + key));
    $(proteinsCssClasses.join(",")).removeClass("h");
}

function hideProteinsAndRemoveItemHighlights() {
    $(".protein").addClass("h");
    $(".item").removeClass("hl");
}

function showNoMatches(isVisible) {
    $(".no-matches").toggleClass("h", !isVisible);
}

function clearSearch() {
    showNoMatches(false);
    $(".protein").removeClass("h");
    $(".item").removeClass("hl");
    setCollapsables($(document), true);
}

function setCollapsables(parent, isVisible) {
    parent.find(".collapseToggle i").toggleClass("fa-chevron-up", !isVisible);
    parent.find(".collapseToggle i").toggleClass("fa-chevron-down", isVisible);
    parent.find(".collapsable-body").toggleClass("show", isVisible);
}

function flatten(xss) {
    return uniq([].concat(...xss));
}

function uniq(xs) {
    return Array.from(new Set(xs));
}
