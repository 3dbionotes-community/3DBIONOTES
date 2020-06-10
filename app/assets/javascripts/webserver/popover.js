$(() => {
    $('[data-toggle="popover"]').each((_idx, el) => {
        const $el = $(el);
        $el.popover({
            trigger: "hover",
            container: $el,
            delay: { show: 750, hide: 150 },
        });
    });

    $('[data-toggle="popover"]').on('show.bs.popover', function (event) {
        if (event.currentTarget.dataset.api){
            $.ajax({
                url: event.currentTarget.dataset.api,
                success:function(response){
                    const keys = Object.keys(response)
                    if (keys.length == 1) {
                        const type = event.currentTarget.dataset.type;
                        const data = response[keys[0]][0];
                        let descriptionText = '';
                        if (type == 'pdb'){
                            descriptionText = data.title + '<br/><b>Authors: </b> ' + data.entry_authors.join(', ') + '<br/><b>Released: </b>' + data.release_date
                        }
                        else{
                            descriptionText = data.deposition.title + '<br/><b>Authors: </b> ' + data.deposition.authors + '<br/><b>Released: </b>' + data.deposition.map_release_date
                        }
                        const el = $(event.currentTarget).find('.no-description');
                        if (el.length > 0){
                            el.html(descriptionText)
                        }
                    }

                },
                error: function(response){
                    const el = $(event.currentTarget).find('.no-description');
                    el.html('')
                }
              });
        }
        
      })
});
