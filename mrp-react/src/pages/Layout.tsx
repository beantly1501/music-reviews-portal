import { Outlet, useNavigate } from "react-router";
import { useState } from "react";
import { TabMenu, TabMenuTabChangeEvent } from "primereact/tabmenu";
import { MOBILE_TABS_MENU, TABS_MENU } from "@shared/utils";
import { useMatchMedia } from "primereact/hooks";

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
        navigate("/all-reviews");
        setSelectedTabIndex(1);
        break;

      case 2:
        navigate("/songs");
        setSelectedTabIndex(2);
        break;

      case 3:
        navigate("/albums");
        setSelectedTabIndex(3);
        break;

      case 4:
        navigate("/artists");
        setSelectedTabIndex(4);
        break;

      case 5:
        navigate("/profile");
        setSelectedTabIndex(5);
        break;
    }
  };

  const isMobile = useMatchMedia("(max-width: 760px)");

  return (
    <div className="flex flex-column">
      <TabMenu
        pt={{
          menu: {
            style: {
              justifyContent: isMobile ? "space-between" : "",
            },
          },
          icon: {
            style: {
              fontSize: isMobile ? "1.5rem" : "",
            },
          },
        }}
        model={isMobile ? MOBILE_TABS_MENU : TABS_MENU}
        className="mx-auto text-center w-full md:w-auto"
        onTabChange={changeTab}
        activeIndex={selectedTabIndex}
      />

      <div className="m-5">
        <Outlet />
      </div>
    </div>
  );
}
