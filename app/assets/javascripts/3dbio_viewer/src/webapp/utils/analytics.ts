import ReactGA from "react-ga";
import _ from "lodash";

/* Non-redux GA analytics helpers. For Redux, check for example the <Citation> component. Steps:
    - Import action.
    - Create mapDispatchToProps.
    - Add dispatch props to Props type.
    - Use redux connect with mapDispatchToProps.
    - Call dispatcher from props.
*/

type AnalyticsData = Event | PageView | OutboundLink;

interface Event {
    type: "event";
    category: string;
    action: string;
    label?: string;
}

interface PageView {
    type: "pageView";
    path: string;
}

interface OutboundLink {
    type: "outboundLink";
    label: string;
}

export function sendAnalytics(data: AnalyticsData) {
    switch (data.type) {
        case "event":
            ReactGA.event({ category: data.category, action: data.action, label: data.label });
            break;
        case "pageView":
            ReactGA.set({ page: data.path });
            ReactGA.pageview(data.path);
            break;
        case "outboundLink":
            ReactGA.outboundLink({ label: data.label }, () => {});
            break;
    }
}

export function sendMultiFilterAnalytics(
    action: string,
    prevValues: string[],
    newSelection: Array<{ value: string }> | undefined
) {
    const currentValues = (newSelection || []).map(x => x.value);
    const newValues = _.difference(currentValues, prevValues);

    _(newValues)
        .uniq()
        .each(newValue => {
            sendAnalytics({ type: "event", category: "filter", action, label: newValue });
        });
}