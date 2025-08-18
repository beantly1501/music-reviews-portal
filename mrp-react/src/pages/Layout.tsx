import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { TabMenu, TabMenuTabChangeEvent } from "primereact/tabmenu";
import { MOBILE_TABS_MENU, TABS_MENU } from "@shared/utils";
import { useMatchMedia } from "primereact/hooks";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMatchMedia("(max-width: 760px)");

  const TAB_PATHS = useMemo(
    () => [
      "/",
      "/all-reviews",
      "/songs",
      "/albums",
      "/artists",
      "/playlists",
      `/profile`,
    ],
    [],
  );

  const model = isMobile ? MOBILE_TABS_MENU : TABS_MENU;

  const activeIndex = useMemo(() => {
    const i = TAB_PATHS.findIndex((playlist) => playlist === location.pathname);
    return i >= 0 ? i : 0;
  }, [location.pathname, TAB_PATHS]);

  const changeTab = (e: TabMenuTabChangeEvent) => {
    const path = TAB_PATHS[e.index];
    if (path) navigate(path);
  };

  return (
    <div className="flex flex-column">
      <TabMenu
        pt={{
          menu: { style: { justifyContent: isMobile ? "space-between" : "" } },
          icon: { style: { fontSize: isMobile ? "1.5rem" : "" } },
        }}
        model={model}
        className="mx-auto text-center w-full md:w-auto"
        activeIndex={activeIndex}
        onTabChange={changeTab}
      />
      <div className="m-5">
        <Outlet />
      </div>
    </div>
  );
}
