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

    const onSearchWithArgsInContainer = (ev) => {
        console.log(proteinsData)
        onSearch2(ev, proteinsData, options);
    }
    $(".dropdown-item").on( "click", onSearchWithArgsInContainer)
   
    
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

function onSearch2(ev, proteinsData, options) {
    const relations = proteinsData.relations;
    const text = $("#search-protein").val();
    const sectionId = $(ev.currentTarget).attr('data-section-id')

    const isExperimentEvent = $(ev.currentTarget).hasClass('experiment')
    const experimentText = isExperimentEvent ? $(ev.currentTarget).html() : $(ev.currentTarget).parents(".paginationText").find(".experiment-selector").text()
    const experiment = isExperimentEvent ?  $(ev.currentTarget).attr('data-experiment-id') : $(ev.currentTarget).parents(".paginationText").find(".experiment-selector").attr('data-experiment-id')
    if (isExperimentEvent){
        $(ev.currentTarget).parents(".filterItem").find(".btn").text(experimentText);
        $(ev.currentTarget).parents(".filterItem").find(".btn").attr('data-experiment-id', experiment);
    }

    const isPocketEvent = $(ev.currentTarget).hasClass('pocket')
    const pocketText = isPocketEvent ? $(ev.currentTarget).html() : $(ev.currentTarget).parents(".paginationText").find(".pocket-selector").text()
    const pocket = isPocketEvent ?  $(ev.currentTarget).attr('data-pocket-id') : $(ev.currentTarget).parents(".paginationText").find(".pocket-selector").attr('data-pocket-id')
    if (isPocketEvent){
        $(ev.currentTarget).parents(".filterItem").find(".btn").text(pocketText);
        $(ev.currentTarget).parents(".filterItem").find(".btn").attr('data-pocket-id', pocket);
    }

    const filters = {sectionId: sectionId, experiment: experiment, pocket: pocket}
    const maxItems = options.maxItems;

    hideProteinsAndRemoveItemHighlights(filters.sectionId)

    if (filters.sectionId){
        const protein = filters.sectionId.split("-")[0]
        const items = Object.keys(relations).filter((key) => {
            return key.toLowerCase().includes(text) &&
                ((filters.experiment != '' && relations[key].experiment && relations[key].protein.toLowerCase() === protein && relations[key].experiment === filters.experiment) ||
                (filters.pocket != '' && relations[key].pockets && relations[key].protein.toLowerCase() === protein && filters.pocket in relations[key].pockets) );
        });
    
        const proteins = flatten(
            items.map((item) => {
                const itemsCssClasses = items.map((name) => ".item-" + name).join(",");
                $('#pSubBod-' + sectionId).find(itemsCssClasses).addClass("hl");
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
