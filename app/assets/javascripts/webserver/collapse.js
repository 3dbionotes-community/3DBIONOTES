$(() => {
    $(".collapsable-body").on("show.bs.collapse hide.bs.collapse", (ev) => {
        const el = $(ev.currentTarget);
        $(`[aria-controls=${el.attr("id")}]`)
            .find("i")
            .toggleClass("fa-chevron-up fa-chevron-down");
    });
});
