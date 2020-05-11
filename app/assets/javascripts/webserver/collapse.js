$(() => {
    $(".collapseToggle").on("click", (ev) => {
        const el = $(ev.currentTarget);
        console.log(el.attr("id"));
        el.find("i").toggleClass("fa-chevron-up fa-chevron-down");
    });
});
