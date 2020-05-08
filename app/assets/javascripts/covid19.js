/* Global variables:

    declare const proteinsData: {
        proteins: Record<string, Protein>,
        relations: Record<string, string[]>,
    }
*/

function initLiveSearch(proteinsData, options) {
    const onSearchWithArgs = (ev) => onSearch(ev, proteinsData, options);
    const onSearchThrottled = throttle(onSearchWithArgs, 300);
    $("#search-protein").keyup(onSearchThrottled);
}

function onSearch(ev, proteinsData, options) {
    const allProteins = proteinsData.proteins;
    const relations = proteinsData.relations;
    const text = $(ev.currentTarget).val().toLowerCase().trim();

    if (!text) {
        clearSearch();
    } else {
        hideProteinsAndRemoveItemHighlights();
        processProteinMatches(allProteins, text) ||
            processItemMatches(relations, text, options) ||
            showMatch({ count: 0, text });
    }
}

function processProteinMatches(allProteins, text) {
    const includesText = (name) => name.toLowerCase().includes(text);
    const proteinNames = uniq(
        allProteins
            .filter((protein) => [protein.name].concat(protein.polyproteins).some(includesText))
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

function processItemMatches(relations, text, options) {
    const maxItems = options.maxItems;
    const items = Object.keys(relations).filter((key) => key.toLowerCase().includes(text));

    if (items.length === 0) {
        return false;
    } else {
        const proteins = flatten(
            items.map((item) => {
                const itemsCssClasses = items.map((name) => ".item-" + name).join(",");
                $(itemsCssClasses).addClass("hl");
                return relations[item];
            })
        );

        showMatch({ count: proteins.length, text });
        showProteins(proteins, { highlightProtein: false });

        proteins.forEach((protein) => {
            $(`.protein-${protein} .card.proteinNest .card-body`).each((_idx, cardEl) => {
                const card = $(cardEl);
                const highlighted = card.find(".item.hl");
                const notHighlighted = card.find(".item:not(.hl)");
                const highlightedCountAll = highlighted.size();
                const highlightedCount = Math.min(highlightedCountAll, maxItems);
                const restCount = maxItems - highlightedCount;
                highlighted.slice(0, highlightedCount).removeClass("h");
                highlighted.slice(highlightedCount).addClass("h");
                notHighlighted.slice(0, restCount).removeClass("h");
                notHighlighted.slice(restCount).addClass("h");
                const hasMatches = highlightedCountAll > 0;
                setCollapsables(card.closest(".card"), hasMatches);
            });
        });

        return true;
    }
}

function showProteins(proteinNames, options) {
    const highlightProtein = options.highlightProtein;
    $(proteinNames.map((k) => `.protein-${k}`).join(",")).removeClass("h");
    if (highlightProtein)
        $(proteinNames.map((k) => `.protein-${k} .protein-name`).join(",")).addClass("hl-label");
}

function hideProteinsAndRemoveItemHighlights() {
    $(".protein").addClass("h");
    $(".item").removeClass("hl");
}

function showMatch(match) {
    const count = match.count;
    const text = match.text;
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
    return [].concat.apply([], xss);
}

function uniq(xs) {
    return Array.from(new Set(xs));
}

function throttle(fn, wait) {
    var timeout = undefined;

    return function () {
        var this_ = this;
        var arguments_ = arguments;

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(function () {
            timeout = undefined;
            fn.apply(this_, arguments_);
        }, wait);
    };
}
