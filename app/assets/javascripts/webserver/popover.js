$(() => {
    $('[data-toggle="popover"]').each((_idx, el) => {
        const $el = $(el);
        $el.popover({
            trigger: "hover",
            container: $el,
            delay: { show: 750, hide: 150 },
        });
    });
});
