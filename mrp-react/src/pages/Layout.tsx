import { Outlet, useNavigate } from "react-router";
import { useState } from "react";
import { TabMenu, TabMenuTabChangeEvent } from "primereact/tabmenu";
import { TABS_MENU } from "../utils/constants.tsx";

export default function Layout() {
  const navigate = useNavigate();
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>();

  const changeTab = (e: TabMenuTabChangeEvent) => {
    switch (e.index) {
      case 0:
        navigate("/");
        setSelectedTabIndex(0);
        break;

      case 1:
        navigate("/songs");
        setSelectedTabIndex(1);
        break;

      case 2:
        navigate("/albums");
        setSelectedTabIndex(2);
        break;

      case 3:
        navigate("/profile");
        setSelectedTabIndex(3);
        break;
    }
  };

  return (
    <div className="flex flex-column">
      <TabMenu
        model={TABS_MENU}
        className="mx-auto"
        onTabChange={changeTab}
        activeIndex={selectedTabIndex}
      />

      <div className="m-5">
        <Outlet />
      </div>
    </div>
  );
}
