import React, { useState } from "react";
import { ModelSearch } from "../../components/model-search/ModelSearch";
import i18n from "../../utils/i18n";
import { DbModel } from "../../../domain/entities/DbModel";
import "./HomeSearch.css";

export const HomeSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (_action: "select" | "append", item: DbModel) => {
        window.location.href = `/ws/viewer/#/${item.id}`;
    };

    return (
        <div id="home-search-container" className="home-search-container">
            <button type="button" className="home-search-btn" onClick={() => setIsOpen(true)}>
                <i className="fa fa-search home-search-btn-icon" aria-hidden="true" />
                <span className="home-search-btn-text">{i18n.t("START BROWSING ENTRIES")}</span>
            </button>

            {isOpen && (
                <ModelSearch
                    title={i18n.t("Search EMDB or PDB")}
                    onClose={() => setIsOpen(false)}
                    onSelect={handleSelect}
                    disableAppend={true}
                />
            )}
        </div>
    );
};
