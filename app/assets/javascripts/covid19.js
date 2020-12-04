/* Initialize covid19 live search:

    proteinsData: {
        proteins: Record<string, {name: string, names: string, description: name, sections: any[], polyproteins: string[]}>,
        relations: Record<string, {protein: string, experiment: string, pocket: string[]}>,
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
    showIfUrlExists($(document));

    const onSearchExperimentInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        const experimentText = currentTarget.html();
        const experiment = currentTarget.attr("data-experiment-id");
        currentTarget.parents(".filterItem").find(".btn").text(experimentText);
        currentTarget.parents(".filterItem").find(".btn").attr("data-experiment-id", experiment);

        const pocket = currentTarget
            .parents(".paginationText")
            .find(".pocket-selector")
            .attr("data-pocket-id");

        const filters = {
            sectionId: currentTarget.attr("data-section-id"),
            experiment: experiment,
            pocket: pocket,
        };

        onSearchInContainer(ev, proteinsData, options, filters);
    };

    const onSearchPocketInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        const pocketText = currentTarget.html();
        const pocket = currentTarget.attr("data-pocket-id");
        currentTarget.parents(".filterItem").find(".btn").text(pocketText);
        currentTarget.parents(".filterItem").find(".btn").attr("data-pocket-id", pocket);

        const experiment = currentTarget
            .parents(".paginationText")
            .find(".experiment-selector")
            .attr("data-experiment-id");

        const filters = {
            sectionId: currentTarget.attr("data-section-id"),
            experiment: experiment,
            pocket: pocket,
        };

        onSearchInContainer(ev, proteinsData, options, filters);
    };

    const onSearchClearPocketInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        clearPocketDropdown(currentTarget);

        const experiment = currentTarget
            .parents(".paginationText")
            .find(".experiment-selector")
            .attr("data-experiment-id");

        const filters = {
            sectionId: currentTarget.attr("data-section-id"),
            experiment: experiment,
            pocket: "",
        };

        onSearchInContainer(ev, proteinsData, options, filters);
    };

    const onSearchClearExperimentInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        clearExperimentDropdown(currentTarget);

        const pocket = currentTarget
            .parents(".paginationText")
            .find(".pocket-selector")
            .attr("data-pocket-id");

        const filters = {
            sectionId: currentTarget.attr("data-section-id"),
            experiment: "",
            pocket: pocket,
        };

        onSearchInContainer(ev, proteinsData, options, filters);
    };

    $(".dropdown-item.experiment").on("click", onSearchExperimentInContainer);
    $(".dropdown-item.clear-experiment").on("click", onSearchClearExperimentInContainer);

    $(".dropdown-item.pocket").on("click", onSearchPocketInContainer);
    $(".dropdown-item.clear-pocket").on("click", onSearchClearPocketInContainer);

    $("#search-protein").keyup(onSearchThrottled);
}

function showIfUrlExists(parent) {
    const promisesFn = parent
        .find(`[data-check]`)
        .get()
        .map((el) => () => showIfUrlExistsFromElement(el));
    runPromisesSequentially(promisesFn);
}

var dataCheckCache = {};

async function showIfUrlExistsFromElement(el) {
    const url = el.getAttribute("data-check");
    if (!url) return;

    const cachedValue = dataCheckCache[url];
    let status;
    if (cachedValue) {
        status = cachedValue;
    } else {
        const res = await fetch(url, { method: "HEAD" });
        status = res.status;
        dataCheckCache[url] = status;
    }

    if (status === 200) {
        $(el).removeClass("h");
    }
}

function clearPocketDropdown(el) {
    el.parents(".paginationText").find(".pocket-selector").removeAttr("data-pocket-id");
    el.parents(".filterItem").find(".btn").text("Pocket");
}

function clearExperimentDropdown(el) {
    el.parents(".paginationText").find(".experiment-selector").removeAttr("data-experiment-id");
    el.parents(".filterItem").find(".btn").text("Experiment");
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

function onSearchInContainer(ev, proteinsData, options, filters) {
    const allProteins = proteinsData.proteins;
    const relations = proteinsData.relations;
    const text = $("#search-protein").val().toLowerCase().trim();
    const maxItems = options.maxItems;

    hideProteinsAndRemoveItemHighlights(filters.sectionId);

    if (
        filters.sectionId &&
        ((getProteinMatch(allProteins, text).length == 0 && text !== "") ||
            (filters.experiment && filters.experiment != "") ||
            (filters.pocket && filters.pocket !== ""))
    ) {
        const sectionSplit = filters.sectionId.split(/-(.+)/);
        const protein = sectionSplit[0];
        const containerId = sectionSplit[1];
        const items = Object.keys(relations).filter((key) => {
            return (
                (getProteinMatch(allProteins, text).length > 0 ||
                    key.toLowerCase().includes(text)) &&
                key.toLowerCase().includes(containerId) &&
                (!filters.experiment ||
                    filters.experiment == "" ||
                    (relations[key].experiment &&
                        relations[key].protein.toLowerCase() === protein &&
                        relations[key].experiment === filters.experiment)) &&
                (!filters.pocket ||
                    filters.pocket == "" ||
                    (relations[key].pockets &&
                        relations[key].protein.toLowerCase() === protein &&
                        relations[key].pockets.includes(parseInt(filters.pocket))))
            );
        });

        const proteins = flatten(
            items.map((item) => {
                const itemsCssClasses = items
                    .map((name) => ".item-" + name.split("-")[0])
                    .join(",");
                $(`#pSubBod-${filters.sectionId}, #modalContent-${filters.sectionId}`)
                    .find(itemsCssClasses)
                    .addClass("hl");
                return relations[item].protein;
            })
        );

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
            });
        });
    }
}

function onSearch(ev, proteinsData, options) {
    const allProteins = proteinsData.proteins;
    const relations = proteinsData.relations;
    const text = $(ev.currentTarget).val().toLowerCase().trim();

    // Reset other filters
    clearPocketDropdown($(".dropdown-item.clear-pocket"));
    clearExperimentDropdown($(".dropdown-item.clear-experiment"));

    if (!text) {
        clearSearch();
    } else {
        hideProteinsAndRemoveItemHighlights();
        processProteinMatches(allProteins, text) ||
            processItemMatches(relations, text, options) ||
            showMatch({ count: 0, text });
    }
}

function getProteinMatch(allProteins, text) {
    const includesText = (name) => name.toLowerCase().includes(text);
    const proteinNames = uniq(
        allProteins
            .filter((protein) => [protein.name].concat(protein.polyproteins).some(includesText))
            .map((protein) => protein.name)
    );
    return proteinNames;
}

function processProteinMatches(allProteins, text) {
    proteinNames = getProteinMatch(allProteins, text);

    if (proteinNames.length === 0) {
        return false;
    } else {
        showMatch({ count: proteinNames.length, text });
        const includesText = (name) => name.toLowerCase().includes(text);
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
                const itemsCssClasses = items
                    .map((name) => ".item-" + name.split("-")[0])
                    .join(",");
                $(itemsCssClasses).addClass("hl");
                return relations[item].protein;
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

function hideProteinsAndRemoveItemHighlights(sectionId = "") {
    if (sectionId == "") {
        $(".protein").addClass("h");
        $(".item").removeClass("hl");
    } else {
        $(`#pSubBod-${sectionId}, #modalContent-${sectionId}`).find(".item").removeClass("hl");
    }
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
