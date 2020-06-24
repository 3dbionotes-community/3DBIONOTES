function mapResizer(maps) {
    if (!maps) {maps = document.getElementsByTagName('map');}
    for (const map of maps) {
        map.img = document.querySelectorAll(`[usemap="#${map.name}"]`)[0];
        map.areas = map.getElementsByTagName('area');
        for (const area of map.areas) {
            area.coordArr = area.coords.split(',');
        }
    }
    function resizeMaps() {
        for (const map of maps) {
            const scale = map.img.offsetWidth / (map.img.naturalWidth || map.img.width);
            for (const area of map.areas) {
                area.coords = area.coordArr.map(coord => Math.round(coord * scale)).join(',');
            }
        }
    }
    window.addEventListener('resize', () => resizeMaps());
    resizeMaps();
}
if (document.readyState == 'complete') {
    mapResizer();
} else {
    window.addEventListener('load', () => mapResizer());
}
