/* Initialize covid19 live search:

    proteinsData: {
        proteins: Record<string, {name: string, polyproteins: string[]}>,
        relations: Record<string, string[]>,
    }

    options: {
        maxItems: number;
    }
*/
function initLiveSearch(proteinsData, options) {
    const onSearchWithArgs = (ev) => onSearch(ev, proteinsData, options);
    const onSearchThrottled = throttle(onSearchWithArgs, 300);
    $("#search-protein").keyup(onSearchThrottled);
    $(".modal.fade").on("show.bs.modal", onModalOpen);
    showIfUrlExists("data-check");
}

function showIfUrlExists(attributeName) {
    const promisesFn = $(`[${attributeName}]`)
        .get()
        .map((el) => () => showIfUrlExistsFromElement(el, attributeName));
    runPromisesSequentially(promisesFn);
}

async function showIfUrlExistsFromElement(el, attributeName) {
    const url = el.getAttribute(attributeName);
    if (!url) return;
    const response = await fetch(url, { method: "HEAD" });
    if (response.status === 200) {
        $(el).removeClass("h");
    }
}

function onModalOpen(ev) {
    const modal = $(ev.currentTarget);
    setImagesSrc(modal);
}

function setImagesSrc(container) {
    container
        .find("img")
        .get()
        .map($)
        .forEach((el$) => el$.attr("src", el$.attr("data-src")));
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
        const highlightTags = uniq(
            flatten(
                allProteins.map((protein) =>
                    [protein.name].concat(protein.polyproteins).filter(includesText)
                )
            )
        );
        showProteins(proteinNames, { highlightTags });
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
        showProteins(proteins, { highlightTags: false });

        proteins.forEach((protein) => {
            $(`.protein-${protein} .card-body > .row`).each((_idx, row) => {
                const card = $(row.closest(".card-body"));
                const highlighted = card.find(".item.hl");
                const notHighlighted = card.find(".item:not(.hl)");
                const highlightedCountAll = highlighted.size();
                const highlightedCount = Math.min(highlightedCountAll, maxItems);
                const restCount = maxItems - highlightedCount;
                highlighted.slice(0, highlightedCount).removeClass("h");
                setImagesSrc(highlighted.slice(0, highlightedCount));
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
    const highlightTags = options.highlightTags;
    $(proteinNames.map((k) => `.protein-${k}`).join(",")).removeClass("h");

    $(".proteinBadge").removeClass("hl-label");
    if (highlightTags) $(highlightTags.map((k) => `.b-${k}`).join(",")).addClass("hl-label");
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

async function runPromisesSequentially(promisesFn) {
    for (const promiseFn of promisesFn) {
        await promiseFn().catch((err) => console.error(err));
    }
}
