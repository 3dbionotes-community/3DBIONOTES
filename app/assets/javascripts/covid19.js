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

    const onSearchExperimentInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        const experimentText = currentTarget.html();
        const experiment = currentTarget.attr('data-experiment-id')
        currentTarget.parents(".filterItem").find(".btn").text(experimentText);
        currentTarget.parents(".filterItem").find(".btn").attr('data-experiment-id', experiment);

        const pocket = currentTarget.parents(".paginationText").find(".pocket-selector").attr('data-pocket-id')

        const filters = {sectionId: currentTarget.attr('data-section-id'), experiment: experiment, pocket: pocket}

        onSearchInContainer(ev, proteinsData, options, filters);
    }

    const onSearchPocketInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        const pocketText = currentTarget.html();
        const pocket = currentTarget.attr('data-pocket-id')
        currentTarget.parents(".filterItem").find(".btn").text(pocketText);
        currentTarget.parents(".filterItem").find(".btn").attr('data-pocket-id', pocket);

        const experiment = currentTarget.parents(".paginationText").find(".experiment-selector").attr('data-experiment-id')

        const filters = {sectionId: currentTarget.attr('data-section-id'), experiment: experiment, pocket: pocket}

        onSearchInContainer(ev, proteinsData, options, filters);
    }

    const onSearchClearPocketInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        currentTarget.parents(".paginationText").find(".pocket-selector").removeAttr('data-pocket-id')
        currentTarget.parents(".filterItem").find(".btn").text('Pocket');

        const experiment = currentTarget.parents(".paginationText").find(".experiment-selector").attr('data-experiment-id')

        const filters = {sectionId: currentTarget.attr('data-section-id'), experiment: experiment, pocket: ''}

        onSearchInContainer(ev, proteinsData, options, filters);
    }

    const onSearchClearExperimentInContainer = (ev) => {
        const currentTarget = $(ev.currentTarget);
        currentTarget.parents(".paginationText").find(".experiment-selector").removeAttr('data-experiment-id')
        currentTarget.parents(".filterItem").find(".btn").text('Experiment');

        const pocket = currentTarget.parents(".paginationText").find(".pocket-selector").attr('data-pocket-id')

        const filters = {sectionId: currentTarget.attr('data-section-id'), experiment: '', pocket: pocket}

        onSearchInContainer(ev, proteinsData, options, filters);
    }

    $(".dropdown-item.experiment").on( "click", onSearchExperimentInContainer)
    $(".dropdown-item.clear-experiment").on( "click", onSearchClearExperimentInContainer)

    $(".dropdown-item.pocket").on( "click", onSearchPocketInContainer)
    $(".dropdown-item.clear-pocket").on( "click", onSearchClearPocketInContainer)
   
    
    $("#search-protein").keyup(onSearchThrottled);
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

    hideProteinsAndRemoveItemHighlights(filters.sectionId)

    if (filters.sectionId && ((getProteinMatch(allProteins, text).length == 0 && text !== '') || (filters.experiment && filters.experiment != '') || (filters.pocket && filters.pocket !== '') )){
        const protein = filters.sectionId.split("-")[0]
        const items = Object.keys(relations).filter((key) => {
            return (getProteinMatch(allProteins, text).length > 0 || key.toLowerCase().includes(text)) &&
                ((!filters.experiment || filters.experiment == '') || (relations[key].experiment && relations[key].protein.toLowerCase() === protein && relations[key].experiment === filters.experiment)) &&
                ((!filters.pocket || filters.pocket == '') || (relations[key].pockets && relations[key].protein.toLowerCase() === protein && relations[key].pockets.includes(parseInt(filters.pocket))) );
        });
    
        const proteins = flatten(
            items.map((item) => {
                const itemsCssClasses = items.map((name) => ".item-" + name).join(",");
                $('#pSubBod-' + filters.sectionId).find(itemsCssClasses).addClass("hl");
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
                const hasMatches = highlightedCountAll > 0;
                setCollapsables(card.closest(".card"), hasMatches);
            });
        });
    }

    
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

function getProteinMatch(allProteins, text){
    const includesText = (name) => name.toLowerCase().includes(text);
    const proteinNames = uniq(
        allProteins
            .filter((protein) => [protein.name].concat(protein.polyproteins).some(includesText))
            .map((protein) => protein.name)
    );
    return proteinNames
}

function processProteinMatches(allProteins, text) {
    proteinNames = getProteinMatch(allProteins, text)

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
                const itemsCssClasses = items.map((name) => ".item-" + name).join(",");
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

function hideProteinsAndRemoveItemHighlights(sectionId = '') {
    if (sectionId == ''){
        $(".protein").addClass("h");
        $(".item").removeClass("hl");
    }
    else{
        $(`#pSubBod-${sectionId} .item`).removeClass("hl");
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
