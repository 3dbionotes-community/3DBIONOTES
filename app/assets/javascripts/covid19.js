// declare proteinsData: {
//    proteins: Record<String, Protein>,
//    relationshsips: {},
//}

$(() => {
    $("#search-protein").keyup((ev) => {
        const text = $(ev.currentTarget).val().toLowerCase().trim();
        console.log(text);
        if (!text) {
            $(".protein").removeClass("h");
            $(".no-matches").addClass("h");
        } else {
            const cssClasses = proteinsData.proteins
                .map((protein) => protein.name)
                .filter((key) => key.toLowerCase().startsWith(text))
                .map((key) => ".protein-" + key);
            $(".protein").addClass("h");
            $(cssClasses.join(",")).removeClass("h");
            const noMatches = cssClasses.length === 0;
            $(".no-matches").toggleClass("h", !noMatches);
        }
    });
});
