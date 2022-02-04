import React from "react";
import _ from "lodash";
import { renderJoin } from "../../utils/react";
import { Link } from "../Link";
import { InfoItem, Content } from "../../../domain/entities/InfoItem";

interface TooltipProps {
    items: InfoItem[];
}

export const GenericTooltip: React.FC<TooltipProps> = React.memo(props => {
    const { items } = props;

    return (
        <TooltipTable>
            {items.map((item, idx) => (
                <TooltipItem key={idx} item={item} />
            ))}
        </TooltipTable>
    );
});

const TooltipTable: React.FC = props => {
    return <table className="tooltip">{props.children}</table>;
};

const TooltipItem: React.FC<{ item: InfoItem }> = props => {
    const { item } = props;
    const [firstContent, ...restOfContents] = item.contents || [];

    return (
        <>
            <TooltipRow title={item.title} content={firstContent} />

            {restOfContents.map(content => (
                <TooltipRow key={content.text} content={content} />
            ))}
        </>
    );
};

function TooltipRow(props: {
    title?: string;
    content?: Content;
    className?: string;
}): React.ReactElement | null {
    const { title, content, className } = props;

    return (
        <tr className={className}>
            <td>{title}</td>
            {content && <td>{<ContentRow content={content} />}</td>}
        </tr>
    );
}

const ContentRow: React.FC<{ content: Content }> = props => {
    const { content } = props;

    return (
        <React.Fragment>
            {content.text}&nbsp;
            {renderJoin(
                (content.links || []).map(link => (
                    <React.Fragment key={link.name}>
                        <Link name={link.name} url={link.url} />
                    </React.Fragment>
                )),
                <span> | </span>
            )}
        </React.Fragment>
    );
};
