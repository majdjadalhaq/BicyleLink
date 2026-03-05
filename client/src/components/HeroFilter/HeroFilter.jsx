import { useHeroFilter } from "./hooks/useHeroFilter";
import SidebarFilterView from "./components/SidebarFilterView";
import DesktopFilterView from "./components/DesktopFilterView";

const HeroFilter = ({
  filters,
  onApply,
  onClear,
  isOpen,
  isSidebar,
  idPrefix = "",
}) => {
  const hookState = useHeroFilter({ filters, onApply, idPrefix });
  const currentYear = new Date().getFullYear();

  if (!isOpen && !isSidebar) return null;

  if (isSidebar) {
    return (
      <SidebarFilterView
        {...hookState}
        onClear={onClear}
        currentYear={currentYear}
      />
    );
  }

  return (
    <DesktopFilterView
      {...hookState}
      onClear={onClear}
      currentYear={currentYear}
    />
  );
};

export default HeroFilter;
