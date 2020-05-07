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
                showMatch({ count: 0, text });
        }
    });
}

function processProteinMatches(allProteins, text) {
    const includesText = (name) => name.toLowerCase().includes(text);
    const proteinNames = uniq(
        allProteins
            .filter((protein) => [protein.name, ...protein.polyproteins].some(includesText))
            .map((protein) => protein.name)
    );

    if (proteinNames.length === 0) {
        return false;
    } else {
        showMatch({ count: proteinNames.length, text });
        showProteins(proteinNames, { highlightProtein: true });
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

        showMatch({ count: proteins.length, text });
        showProteins(proteins, { highlightProtein: false });

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

function showProteins(proteinNames, options) {
    const { highlightProtein } = options;
    $(proteinNames.map((k) => `.protein-${k}`).join(",")).removeClass("h");
    if (highlightProtein)
        $(proteinNames.map((k) => `.protein-${k} .protein-name`).join(",")).addClass("hl-label");
}

function hideProteinsAndRemoveItemHighlights() {
    $(".protein").addClass("h");
    $(".item").removeClass("hl");
}

function showMatch(match) {
    const { count, text } = match;
    $(".matches-length").text(count);
    $(".matches-text").text(text);

    if (count > 0) {
        $(".no-matches").addClass("h");
        $(".matches").removeClass("h");
    } else {
        $(".no-matches").removeClass("h");
        $(".matches").addClass("h");
    }
}

function clearSearch() {
    $(".no-matches").addClass("h");
    $(".matches").addClass("h");
    $(".protein").removeClass("h");
    $(".protein-name.hl-label").removeClass("hl-label");
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
